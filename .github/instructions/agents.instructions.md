Sebelum mulai mengerjakan task apa pun, kamu WAJIB:

1. Membaca dan memahami file `serena.instructions.md`.
2. Menggunakan Serena MCP Tools selama proses analisis dan implementasi.
3. Melakukan analyze terhadap codebase terlebih dahulu sebelum menulis atau mengubah kode apa pun.

## Mandatory Codebase Analysis

Sebelum implementasi:

d- Pahami struktur project, architecture, coding pattern, dependency, dan flow aplikasi.

- Identifikasi existing abstraction, reusable utility, convention, dan module yang sudah ada.
- Jangan langsung implementasi tanpa memahami context codebase secara menyeluruh.
- Hindari duplicate logic dan pastikan solusi mengikuti existing architecture.

## Mandatory User Interview

Setelah selesai analyze codebase, kamu WAJIB melakukan interview kepada user menggunakan `AskUserQuestionTool`.

Interview harus dilakukan secara detail dan mendalam mengenai:

- Technical implementation yang diinginkan
- Existing behavior
- Expected behavior
- Constraint dan restriction
- Tradeoff yang diinginkan
- Performance concern
- Security concern
- Scalability concern
- Backward compatibility
- Edge case
- Use case
- Acceptance criteria
- Non-goals
- Deployment impact
- Database impact
- API contract impact
- Testing expectation
- dan hal teknis relevan lainnya

## Communication Rules

Saat interview:

- Gunakan bahasa Indonesia.
- Gunakan plain language yang mudah dipahami.
- Hindari istilah yang terlalu kompleks tanpa penjelasan.
- Tanya satu per satu secara terstruktur dan sistematis.
- Jangan membuat asumsi tanpa konfirmasi dari user.

## Planning Rules

Setelah mendapatkan jawaban dari user:

1. Analisis semua kemungkinan edge case dan use case.
2. Identifikasi failure scenario, race condition, invalid input, dan potential regression.
3. Susun implementation plan yang detail sebelum coding.
4. Masukkan seluruh edge case dan use case ke dalam plan.
5. Jelaskan tradeoff dari pendekatan yang dipilih jika diperlukan.

## Implementation Rules

Baru setelah:

- analyze codebase selesai,
- interview user selesai,
- dan implementation plan selesai dibuat,

kamu boleh mulai implementasi.

Saat implementasi:

- Ikuti existing architecture dan coding convention project.
- Prioritaskan maintainability dan readability.
- Hindari overengineering.
- Pastikan backward compatibility tetap aman kecuali diminta sebaliknya.
- Tambahkan validation, error handling, dan test coverage yang relevan.
- Jangan melakukan breaking change tanpa konfirmasi user.
