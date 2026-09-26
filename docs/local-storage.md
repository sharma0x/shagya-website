# Local object storage (RustFS, formerly MinIO)

`make infra-up` starts an S3-compatible store on ports 9000 (API) / 9001
(console). Credentials: `minioadmin` / `minioadmin`. Bucket: `shayga-media`.

Production uses Cloudflare R2 and is unaffected — the app reaches storage
exclusively through the `R2_*` variables in `.env`, never by image name.

## Why the image changed

The stack used MinIO. MinIO's community edition is now distributed
**source-only**: the `minio/minio` and `minio/mc` repositories were removed from
Docker Hub, and the quay.io copies reject anonymous pulls from most networks.
The upshot is that `minio/minio:latest` cannot be fetched at all and
`make infra-up` failed outright with:

```
Error response from daemon: pull access denied for minio/minio,
repository does not exist or may require 'docker login'
```

`rustfs/rustfs:latest` is a maintained, S3-API-compatible replacement that is
still published on Docker Hub, and it serves the same ports with the same
credentials so nothing in `.env` had to change.

Note the container, volume and service are still named `minio` / `shayga-minio`
to avoid churning every reference to them. Only the image changed.

## The bucket must be created, and must be public

The old stack had a `minio/mc` sidecar that created `shayga-media` on boot.
`minio/mc` no longer exists, and **RustFS does not auto-create buckets** — a
seed against a fresh volume fails with:

```
NoSuchBucket: The specified bucket does not exist
```

It also does **not** default to public buckets the way MinIO did. Payload's
`generateFileURL` (`src/payload.config.ts`) builds media URLs directly from
`R2_ENDPOINT`/`R2_BUCKET`, so a private bucket makes **every CMS image 403** —
blog thumbnails, policy images, and any OG image. This is silent in a
`curl` status sweep because those pages still return 200; it only shows up as
broken images in a browser.

`seed-local` therefore runs `scripts/ensure-storage-bucket.mjs` first, which:

1. issues a SigV4-signed `CreateBucket`, and
2. PUTs a bucket policy granting anonymous `s3:GetObject`.

RustFS ignores the classic `?acl=public-read` call and honours only a bucket
policy. Both steps are idempotent, so re-running is safe. If you ever wipe the
volume (`make infra-reset`), re-run `make seed-local` rather than `pnpm seed`
directly.

## Verifying storage actually works

Uploading successfully is not the same as serving. To check the full round-trip:

```bash
# 1. anonymous read of a stored object (should be 200 + image/jpeg)
curl -s -o /tmp/x.jpg -w '%{http_code} %{content_type}\n' \
  http://localhost:9000/shayga-media/blog-1.jpg

# 2. no broken images in a real browser
#    open http://localhost:3000/blog and confirm the thumbnails render
```

If step 1 returns 403, re-run `make seed-local` (or the script directly) to
re-apply the public-read policy.

## Troubleshooting

| Symptom                          | Cause                                   | Fix                                      |
| -------------------------------- | --------------------------------------- | ---------------------------------------- |
| `NoSuchBucket`                   | bucket missing after a volume reset     | `make seed-local`                        |
| Images 403 from `localhost:9000` | bucket is private                       | re-run the script to re-apply the policy |
| `ECONNREFUSED :9000`             | storage container not up                | `make infra-up`                          |
| pull denied on `quay.io/*`       | anonymous pulls blocked on this network | use the Docker Hub `rustfs/rustfs` image |
