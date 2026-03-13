# 파일 업로드 — S3 교체 가이드

현재 로컬 파일시스템(`uploads/`) 사용 중 → Render 재배포 시 파일 소멸.
AWS S3로 교체하면 영구 저장 가능.

## 플랫폼 구성

| 서비스 | 플랫폼 | 비고 |
|--------|--------|------|
| 파일 저장 | AWS S3 | 프리티어 5GB/월 |
| 접근 제어 | IAM | 전용 유저 생성 권장 |

---

## 절차

### 1. AWS S3 버킷 생성

1. AWS Console → S3 → **Create bucket**
2. Bucket name: `reel-s3-bucket` (전 세계 유일해야 함)
3. Region: `ap-northeast-2` (서울)
4. **Block all public access**: 체크 해제 (퍼블릭 읽기 허용할 경우)
5. 생성 완료

### 2. IAM 유저 생성

1. AWS Console → IAM → Users → **Create user**
2. 이름: `reel-s3-user`
3. **Attach policies directly** → `AmazonS3FullAccess` 선택
4. 생성 후 **Access key** 발급 → `Access Key ID`, `Secret Access Key` 복사

### 3. 버킷 퍼블릭 읽기 정책 설정 (선택)

업로드된 이미지를 URL로 직접 서빙할 경우 Bucket Policy 추가:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::reel-s3-bucket/*"
    }
  ]
}
```

### 4. 백엔드 의존성 추가

`backend/build.gradle.kts`:

```kotlin
implementation("software.amazon.awssdk:s3:2.25.0")
```

### 5. 환경변수 추가

Render Web Service → **Environment** 탭:

| 변수명 | 값 |
|--------|-----|
| `AWS_ACCESS_KEY_ID` | IAM Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Access Key |
| `AWS_S3_BUCKET` | `reel-s3-bucket` |
| `AWS_S3_REGION` | `ap-northeast-2` |

### 6. application-prod.yml 추가

```yaml
cloud:
  aws:
    s3:
      bucket: ${AWS_S3_BUCKET}
    region:
      static: ${AWS_S3_REGION}
    credentials:
      access-key: ${AWS_ACCESS_KEY_ID}
      secret-key: ${AWS_SECRET_ACCESS_KEY}
    stack:
      auto: false
```

### 7. S3Uploader 서비스 구현

```java
@Service
@RequiredArgsConstructor
public class S3Uploader {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static}")
    private String region;

    public String upload(MultipartFile file, String dirName) throws IOException {
        String key = dirName + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build(),
            RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    public void delete(String fileUrl) {
        String key = fileUrl.substring(fileUrl.indexOf(".amazonaws.com/") + 15);
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
```

### 8. 기존 로컬 업로드 코드 교체

기존에 `upload.path` 로컬 경로에 저장하던 코드를 `S3Uploader.upload()` 호출로 교체.

---

## 다음 단계

→ [05_domain-oauth.md](./05_domain-oauth.md) — OAuth redirect URI 갱신
