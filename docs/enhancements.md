🔴 1. Missing: Exact API Base Config

Antigravity needs to know where + how to call APIs

👉 Add this section:

## 🌐 API Configuration

- Base URL: `http://localhost:8000` (or production URL)
- Headers:
  - Authorization: Bearer <JWT>
  - Content-Type: multipart/form-data (POST)
- Timeout: 30s recommended


🔴 2. Missing: Concrete API Client Code (VERY IMPORTANT)

Antigravity performs MUCH better if you give ready API functions

👉 Add:

## 🔌 API Client (Frontend)

### Create Separation

```ts
export async function createSeparation(formData: FormData) {
  const res = await fetch('/separate/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  if (!res.ok) throw new Error('Failed to create job')
  return res.json()
}

Poll Status
export async function getSeparationStatus(userId: string, taskId: string) {
  const res = await fetch(
    `/download/?user_id=${userId}&task_id=${taskId}`
  )
  return res.json()
}

🔴 4. Missing: File Upload Constraints (Frontend Critical)

Right now it's vague.

## 📦 File Upload Constraints

- Supported formats: mp3, wav
- Max size: (not defined → recommend 50MB)
- Validation:
  - Reject non-audio files
  - Show error before API call

  🔴 5. Missing: UI Interaction Details (Micro UX)

Antigravity needs behavior hints.

## 🎨 UX Behavior Details

- Disable submit button during upload
- Show file name preview before submit
- Show progress animation (fake or real)
- Auto-scroll to results after completion
- Allow re-upload after failure

🔴 6. Missing: Folder Structure (IMPORTANT for Antigravity)

You mentioned architecture, but not exact structure.

## 📁 Frontend Folder Structure

app/
  separation/
    page.tsx
    components/
      UploadForm.tsx
      StatusTracker.tsx
      StemGallery.tsx
  lib/
    api.ts
  hooks/
    useSeparation.ts


   🔴 7. Missing: Hook-Level Integration (React Query)

This is HUGE for Antigravity.

export function useSeparation() {
  return useMutation({
    mutationFn: createSeparation
  })
}

export function useSeparationStatus(taskId: string) {
  return useQuery({
    queryKey: ['separation', taskId],
    queryFn: () => getSeparationStatus(userId, taskId),
    refetchInterval: 3000,
    enabled: !!taskId
  })
}


🔴 8. Missing: Empty States + Edge UI

You covered logic, not UX polish.

## 🧊 Empty & Edge UI States

- No file selected → disable submit
- No results → show placeholder UI
- Error → retry button + message
- Loading → skeleton or spinner


expectations;
After adding:

👉 Antigravity should:

Auto-generate API layer ✅
Correct polling logic ✅
Proper UI states ✅
Working components (not just layout) ✅