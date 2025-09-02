import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("קישור לאיפוס סיסמה נשלח אליך למייל");
      } else {
        alert("שגיאה – בדוק את כתובת האימייל");
      }
    } catch (error) {
      console.error(error);
      alert("בעיה בחיבור לשרת");
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">איפוס סיסמה</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="הכנס אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-4"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          שלח קישור
        </button>
      </form>
    </div>
  );
}
