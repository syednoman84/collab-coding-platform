# ⚔️ Code Battle - Real-Time Collaborative Coding Platform

**Code Battle** is a full-stack, real-time collaborative coding platform for competitive programming, pair programming, and live coding sessions. Built with **Java Spring Boot** and **ReactJS**, the platform supports dynamic problem activation, code execution, and real-time user collaboration via WebSockets.

---

## 🚀 Features

- 👨‍💻 **Live Coding Arena**  
  Users can write Java code in-browser and execute it against backend test cases with instant feedback.

- 🔁 **Paired vs Isolated Programming Modes**  
  Admins can choose whether a problem should be solved collaboratively or individually.

- 📡 **WebSocket Communication (STOMP + SockJS)**  
  Real-time code synchronization, participant updates, and leaderboard broadcasting.

- 🧠 **Test Case Validation**  
  Backend compiles and runs code using the Java Compiler API and verifies against defined test cases.

- 🧑‍🏫 **Role-Based Access (Admin/User)**  
  - Admins can:
    - Manage questions (CRUD)
    - Activate or clear problems
    - View all participants and problem mode
  - Users:
    - Join problem sessions
    - View live participant status and solve problems

- 📨 **Email Notification to Admin**  
  Users can click "Notify Admin" to send their solution to a configured admin email with test case results.

- 📁 **JSON-Based Question Management**  
  Problems and test cases are stored in a shared `questions.json` file, accessed by both the problem and question services.

- 🌈 **Customizable Theme**  
  Vibrant and modern UI using CSS (with Tailwind optional), keyboard-based interaction, and clean navigation.

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|--------------------------|
| Frontend  | React, React Router, CSS, Monaco Editor |
| Backend   | Spring Boot, Java 17, WebSocket (STOMP), Java Compiler API, JavaMail |
| Storage   | JSON file-based (questions.json) |
| Build Tool | Vite, Maven              |
| Others    | SockJS, PostCSS, Tailwind CSS (optional) |
