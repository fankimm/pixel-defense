# Pixel Defense 배포 가이드

## iOS에서 파일로 실행이 안 되는 이유
iOS Safari는 보안상 file:// 프로토콜에서 JavaScript 실행을 제한합니다.

## 해결 방법

### 방법 1: GitHub Pages (무료, 추천)
1. GitHub에 새 저장소 생성
2. `pixel-defense-minified.html`을 `index.html`로 이름 변경
3. 저장소에 업로드
4. Settings → Pages → Source를 "Deploy from a branch"로 설정
5. Branch를 main으로 선택
6. 몇 분 후 `https://[username].github.io/[repository-name]`에서 접속 가능

### 방법 2: Netlify Drop (가장 빠름)
1. https://app.netlify.com/drop 접속
2. `pixel-defense-minified.html`을 `index.html`로 이름 변경
3. 파일을 드래그 앤 드롭
4. 즉시 URL 생성됨

### 방법 3: Vercel
1. https://vercel.com 가입
2. 새 프로젝트 생성
3. HTML 파일 업로드
4. 자동 배포

### 방법 4: 로컬 서버 (개발용)
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# 그 다음 모바일에서 접속:
http://[컴퓨터IP]:8000
```

## 테스트 파일들

- **pixel-defense-standalone.html**: 가장 단순한 버전 (file://에서도 작동 가능성 높음)
- **pixel-defense-ios.html**: iOS 최적화 버전
- **pixel-defense-v0.4.html**: 정식 버전 (서버 필요)

## 홈 화면에 추가하기 (PWA처럼 사용)
1. Safari에서 게임 페이지 열기
2. 공유 버튼 탭
3. "홈 화면에 추가" 선택
4. 이제 앱처럼 실행 가능!