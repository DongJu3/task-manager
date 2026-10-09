# Personal Task Manager

개인의 할 일, 일정, 목표를 효율적으로 관리하는 **웹 기반 할 일 관리 애플리케이션**입니다.

## 🌟 특징

- **할 일 관리**: 제목, 설명, 마감일, 우선순위, 카테고리 설정
- **캘린더 뷰**: 월간 캘린더에서 일정 한눈에 확인
- **통계 대시보드**: 활동 분석 및 진행률 시각화
- **반복 일정**: 매일/매주/매월 반복되는 일정 자동 관리
- **데이터 백업**: JSON 형식으로 데이터 내보내기/불러오기
- **라이트/다크 모드**: 사용자 선호에 따른 테마 전환
- **로컬 저장**: 서버 없이 브라우저에서 모든 데이터 관리
- **반응형 디자인**: PC 및 모바일에서 사용 가능

## 🛠️ 기술 스택

- **프론트엔드**: React 18 + TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS v4
- **상태 관리**: React Context API
- **데이터 저장**: IndexedDB
- **차트**: Recharts
- **아이콘**: Lucide React
- **날짜 처리**: date-fns

## 📦 설치 및 실행

### 필수 사항
- Node.js 16+ 
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone https://github.com/DongJu3/task-manager.git
cd task-manager
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속

### 4. 프로덕션 빌드
```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Common/         # 공통 컴포넌트 (TaskCard, TaskModal)
│   └── Layout/         # 레이아웃 컴포넌트 (Sidebar, Header)
├── pages/              # 페이지 컴포넌트
│   ├── Dashboard.tsx
│   ├── TasksPage.tsx
│   ├── CalendarPage.tsx
│   ├── StatisticsPage.tsx
│   └── SettingsPage.tsx
├── context/            # React Context (상태 관리)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
│   ├── storage/db.ts   # IndexedDB 저장소
│   └── taskHelper.ts   # 할 일 헬퍼 함수
├── App.tsx             # 메인 앱 컴포넌트
└── index.css           # Tailwind CSS
```

## 🎯 주요 기능

### 할 일 관리
- ✅ 할 일 CRUD (생성, 읽기, 수정, 삭제)
- ✅ 우선순위 설정 (높음, 보통, 낮음)
- ✅ 카테고리 관리
- ✅ 마감일 및 시간 설정
- ✅ 하위 할 일 (체크리스트)
- ✅ 반복 일정 (매일, 매주, 매월)
- ✅ 검색 및 필터링
- ✅ 정렬 기능

### 대시보드
- 📊 오늘의 할 일 요약
- 📈 완료율 표시
- ⚠️ 기한 만료 알림
- 📅 이번 주 일정
- 🏷️ 카테고리별 진행률

### 캘린더
- 📆 월간 캘린더 뷰
- 📍 마감일별 일정 표시
- 🔍 날짜 선택 시 해당 일정 상세 조회

### 통계
- 📊 최근 7일 활동 그래프
- 🥧 전체 완료율 (원형 차트)
- 📊 카테고리별 진행 현황 (막대 차트)
- 📊 우선순위별 진행 현황
- 📋 상세 통계 테이블

### 설정
- 🎨 테마 선택 (라이트/다크/시스템)
- 🏷️ 카테고리 추가/편집/삭제
- 💾 데이터 백업 (JSON 내보내기)
- 📥 데이터 복원 (JSON 불러오기)
- 🔄 전체 데이터 초기화

## 💾 데이터 저장

- **IndexedDB 기반**: 모든 데이터는 브라우저의 IndexedDB에 저장
- **자동 저장**: 변경사항이 실시간으로 자동 저장
- **영구 저장**: 페이지 새로고침 후에도 데이터 유지
- **백업 기능**: 설정 메뉴에서 데이터를 JSON으로 내보내기/불러오기 가능

## ⚠️ 주의사항

1. **기기 동기화 없음**: 다른 기기에서는 데이터가 공유되지 않습니다
2. **브라우저 종속**: 같은 브라우저에서만 데이터가 유지됩니다
3. **주기적 백업**: 중요한 데이터는 정기적으로 백업하세요
4. **싱글 사용자**: 1명의 사용자만 사용 가능합니다

## 🚀 향후 개선 계획

- [ ] 클라우드 동기화 (Firebase/Supabase)
- [ ] 알림/리마인더 기능
- [ ] 태그 시스템 추가
- [ ] 할 일 템플릿
- [ ] 협업 기능
- [ ] 모바일 앱 (React Native)
- [ ] 음성 명령
- [ ] AI 기반 일정 제안

## 📄 라이센스

MIT License - 자유롭게 사용할 수 있습니다

## 🤝 기여

버그 리포트 및 기능 제안은 이슈를 통해 제출해주세요.

## 👨‍💻 개발자

**Claude Haiku 4.5** - AI Assistant by Anthropic

---

**Happy Task Managing! 🎉**
