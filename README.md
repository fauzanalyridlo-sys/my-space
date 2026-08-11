# My Space

> A personal space to record, reflect, and understand everyday life.

**My Space** is a personal web application built for myself.

The idea is simple: create one place where I can write down things from my everyday life, reflect on what happened, plan what comes next, and gradually turn those records into something more meaningful.

This project is intentionally built step by step. Features will be added as new ideas come up from my actual daily needs.

---

## Why My Space?

My daily routine is constantly changing.

There are days when I am productive, days when I am tired, days when I learn something new, and days when I simply need some time to think.

Instead of letting those moments disappear, My Space is intended to become a personal digital space for recording them.

The goal is not to build another generic productivity application.

It is to build something that is actually useful for **my own life**.

---

## 🧭 Current Direction

My Space will gradually grow around several areas:

- 📝 **Notes** — free-form personal notes
- 🌙 **Daily Reflection** — reflect on the day and prepare for tomorrow
- 📅 **Tomorrow** — things that need to be done next
- 🏃 **Activity** — gym, running, and other activities
- 🎵 **Music** — music and moments associated with it
- 🤖 **AI** — personal assistance and insights from collected data
- 🔌 **ESP32** — physical interaction with My Space through an ESP32 and LCD

These features are not all implemented yet.

The application will evolve together with my daily life.

---

## 🚧 Current Progress

### Notes

- [x] Create note
- [x] Display notes
- [x] Edit note
- [x] Delete note
- [x] Persist notes in PostgreSQL

### Daily Reflection

- [ ] Reflection database model
- [ ] Daily reflection form
- [ ] View previous reflections
- [ ] Edit reflection
- [ ] Reflection history

### Personal Dashboard

- [ ] Today's overview
- [ ] Tomorrow's tasks
- [ ] Recent notes
- [ ] Daily reflection status
- [ ] Activity summary

### AI

- [ ] OpenRouter integration
- [ ] Personal AI assistant
- [ ] Analyze reflections
- [ ] Weekly/monthly summaries
- [ ] Context-aware suggestions

### ESP32

- [ ] ESP32 connection
- [ ] Web → ESP32 communication
- [ ] LCD display
- [ ] Current time
- [ ] Music information
- [ ] Random note / message
- [ ] Daily information

---

## 🛠️ Tech Stack

### Frontend

- [Next.js](https://nextjs.org/)
- React
- TypeScript
- Tailwind CSS

### Backend / Data

- Next.js Server Components
- Next.js Server Actions
- Prisma ORM
- PostgreSQL

### Planned

- OpenRouter AI
- ESP32
- LCD
- REST API / device API if needed

---

## 🏗️ Architecture

The application currently follows a simple Next.js architecture:

```text
Browser
   │
   ▼
Next.js
   │
   ├── Server Components
   │
   ├── Client Components
   │
   └── Server Actions
           │
           ▼
        Prisma
           │
           ▼
      PostgreSQL