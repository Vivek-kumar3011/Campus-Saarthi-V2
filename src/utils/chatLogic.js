// utils/chatLogic.js
import { CONTACT_DATA } from '../data/contactData';
import { CLASS_SCHEDULE_DATA } from '../data/classData';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const logUnanswered = async (question) => {
  try {
    await addDoc(collection(db, "unanswered_questions"), {
      query: question,
      timestamp: serverTimestamp(),
    });
  } catch (e) { console.error(e); }
};

const isSimilar = (query, targets) => {
  const q = query.toLowerCase().trim();
  const targetArray = Array.isArray(targets) ? targets : [targets];
  return targetArray.some(t => q.includes(t.toLowerCase()) && q.length >= 3);
};

export const getBotResponse = async (userInput) => {
  const cleanInput = userInput.toLowerCase().trim();

  // 1. ATTENDANCE
  if (isSimilar(cleanInput, ["attendance", "75%", "present", "absent"])) {
    return "📈 Keep track of your criteria! Open the **Attendance** feature to log your subject-wise presence and see if you hit that 75% mark.";
  }

  // 2. MESS MENU
  if (isSimilar(cleanInput, ["mess", "food", "lunch", "dinner", "breakfast", "menu"])) {
    return "🍴 Hungry? The **Mess Menu** section shows today's specials for breakfast, lunch, and dinner.";
  }

  // 3. CLASS SCHEDULE
  if (isSimilar(cleanInput, ["class", "schedule", "time table", "lecture", "room"])) {
    const branches = Object.keys(CLASS_SCHEDULE_DATA).join(", ");
    return `📅 I have schedules for: **${branches}**. Check the **Class Schedule** feature for timings and room numbers.`;
  }

  // 4. ACADEMIC HUB (Notes & PYQs)
  if (isSimilar(cleanInput, ["notes", "pyq", "paper", "study", "material", "academic"])) {
    return "📚 Head to the **Academic Hub** to download subject notes, previous year papers, and other study materials.";
  }

  // 5. OPPORTUNITIES (Jobs/Internships)
  if (isSimilar(cleanInput, ["job", "internship", "career", "placement", "hiring", "opportunity"])) {
    return "💼 Looking for a career boost? The **Opportunities** tab lists the latest internships and job openings for our campus.";
  }

  // 6. COMMUNITY CHAT
  if (isSimilar(cleanInput, ["group chat", "community", "talk", "students", "message"])) {
    return "💬 Want to talk to everyone? Use the **Community Chat** to join the global campus conversation.";
  }

  // 7. CAMPUS DIRECTORY & CONTACTS
  if (isSimilar(cleanInput, ["contact", "email", "phone", "teacher", "faculty", "office", "directory"])) {
    const allContacts = [...CONTACT_DATA.office, ...CONTACT_DATA.faculty];
    const words = cleanInput.split(/\s+/);
    for (let contact of allContacts) {
      if (words.some(w => w.length >= 3 && (contact.name.toLowerCase().includes(w) || contact.role.toLowerCase().includes(w)))) {
        return `👤 **${contact.name}** (${contact.role}): ${contact.email}. You can find more in the **Campus Directory**.`;
      }
    }
    return "📞 Need a specific number? The **Campus Directory** has all faculty and emergency contacts.";
  }

  // 8. TASK MANAGER
  if (isSimilar(cleanInput, ["task", "todo", "assignment", "deadline", "manage"])) {
    return "✅ Stay organized! Use the **Task Manager** to add your assignments and set deadlines so you never miss a submission.";
  }

  // 9. BUY & SELL
  if (isSimilar(cleanInput, ["buy", "sell", "marketplace", "cycle", "book", "price"])) {
    return "💰 The **Buy & Sell** marketplace is where you can find great deals on used campus essentials like cycles and books.";
  }

  // 10. LOST & FOUND
  if (isSimilar(cleanInput, ["lost", "found", "missing", "wallet", "keys"])) {
    return "🔍 If you've lost or found something, post an alert in the **Lost & Found** section to help it get returned.";
  }

  // 11. NOTICES
  if (isSimilar(cleanInput, ["notice", "announcement", "update", "alert"])) {
    return "🔔 Check the **Notices** section for official administrative announcements and campus updates.";
  }

  // DEFAULT
  await logUnanswered(userInput);
  return "🤔 I'm not sure about that. Try asking about 'Attendance', 'Mess Menu', 'PYQs', or 'Faculty contacts'.";
};