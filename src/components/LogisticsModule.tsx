import React, { useState, useEffect } from "react";
import {
  CalendarRange,
  Book,
  Bus,
  Home,
  Package,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  UserCheck,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { Homework, TimetableItem, LibraryBook, TransportRoute, HostelRoom, InventoryItem, GRADE_LEVELS } from "../types";

interface LogisticsModuleProps {
  homework: Homework[];
  setHomework: React.Dispatch<React.SetStateAction<Homework[]>>;
  timetable: TimetableItem[];
  setTimetable: React.Dispatch<React.SetStateAction<TimetableItem[]>>;
  books: LibraryBook[];
  setBooks: React.Dispatch<React.SetStateAction<LibraryBook[]>>;
  routes: TransportRoute[];
  setRoutes: React.Dispatch<React.SetStateAction<TransportRoute[]>>;
  rooms: HostelRoom[];
  setRooms: React.Dispatch<React.SetStateAction<HostelRoom[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  initialSubTab?: "homework" | "timetable" | "library" | "inventory";
}

export function LogisticsModule({
  homework,
  setHomework,
  timetable,
  setTimetable,
  books,
  setBooks,
  routes,
  setRoutes,
  rooms,
  setRooms,
  inventory,
  setInventory,
  initialSubTab,
}: LogisticsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"homework" | "timetable" | "library" | "inventory">("homework");

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Homework submission state
  const [newHomework, setNewHomework] = useState({
    title: "",
    subject: "Physics",
    className: "Class 10",
    deadline: "2026-08-01",
    description: "",
  });

  // Library Book Form State
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    quantity: 10,
  });

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomework.title) return;

    const added: Homework = {
      id: `HW_${Date.now()}`,
      title: newHomework.title,
      subject: newHomework.subject,
      className: newHomework.className,
      description: newHomework.description || "Assigned by faculty supervisor.",
      deadline: newHomework.deadline,
      status: "Assigned",
    };

    setHomework([added, ...homework]);
    alert(`Homework homework assigned: ${newHomework.title}`);
    setNewHomework({ title: "", subject: "Physics", className: "Class 10", deadline: "2026-08-01", description: "" });
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;

    const added: LibraryBook = {
      id: `BK_${Date.now()}`,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn || `ISBN-${Math.floor(10000 + Math.random() * 90000)}`,
      quantity: Number(newBook.quantity) || 5,
      borrowed: 0,
    };

    setBooks([added, ...books]);
    alert(`Book successfully registered in Catalog: ${newBook.title}`);
    setNewBook({ title: "", author: "", isbn: "", quantity: 10 });
  };

  const handleBorrowBook = (bookId: string) => {
    const updated = books.map((b) => {
      if (b.id === bookId && b.borrowed < b.quantity) {
        return { ...b, borrowed: b.borrowed + 1 };
      }
      return b;
    });
    setBooks(updated);
    alert("Book checkout issued successfully.");
  };

  const handleReturnBook = (bookId: string) => {
    const updated = books.map((b) => {
      if (b.id === bookId && b.borrowed > 0) {
        return { ...b, borrowed: b.borrowed - 1 };
      }
      return b;
    });
    setBooks(updated);
    alert("Book returned successfully to the shelf.");
  };

  const handleRestockInventory = (itemId: string) => {
    const updated = inventory.map((i) => {
      if (i.id === itemId) {
        return { ...i, stock: i.stock + 50, status: "In Stock" as const };
      }
      return i;
    });
    setInventory(updated);
    alert("Inventory restocked successfully (+50 units).");
  };

  return (
    <div className="space-y-6" id="logistics-module-root">
      {/* Sub tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("homework")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "homework" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Homework Assignments
        </button>
        <button
          onClick={() => setActiveSubTab("timetable")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "timetable" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Class Timetable Schedule
        </button>
        <button
          onClick={() => setActiveSubTab("library")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "library" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Library Catalogs
        </button>
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`px-3.5 py-2 text-xs font-bold border-b-2 transition ${
            activeSubTab === "inventory" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Assets & Stock Inventory
        </button>
      </div>

      {/* SUB-VIEW: Homework Tracker */}
      {activeSubTab === "homework" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Assignment Creation form */}
          <form onSubmit={handleAddHomework} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 h-fit">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
              Assign New Homework Task
            </h4>
            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-600 mb-1">Homework / Title Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Quadratic Equation Sheet"
                  value={newHomework.title}
                  onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Subject</label>
                  <select
                    value={newHomework.subject}
                    onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Class Grade</label>
                  <select
                    value={newHomework.className}
                    onChange={(e) => setNewHomework({ ...newHomework, className: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  >
                    {GRADE_LEVELS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Submission Deadline *</label>
                <input
                  type="date"
                  required
                  value={newHomework.deadline}
                  onChange={(e) => setNewHomework({ ...newHomework, deadline: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="Complete the assigned questions and submit physical files..."
                  value={newHomework.description}
                  onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
              >
                Broadcast Assignment
              </button>
            </div>
          </form>

          {/* List assignments */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            {homework.map((hw) => (
              <div key={hw.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 relative">
                <span className="absolute top-4 right-4 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                  {hw.status}
                </span>

                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-slate-800 text-xs">{hw.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    Class: {hw.className} | Subject: {hw.subject}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{hw.description}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-2 mt-2">
                  <span>Deadline: {hw.deadline}</span>
                  <button
                    onClick={() => {
                      alert("Simulating student submission records view...");
                    }}
                    className="text-[10px] text-blue-600 font-extrabold hover:underline"
                  >
                    View Submissions Log →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: Timetable Schedule */}
      {activeSubTab === "timetable" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-3.5">Academic Day</th>
                <th className="p-3.5">Grade Level</th>
                <th className="p-3.5">Assigned Subject</th>
                <th className="p-3.5">Instructor</th>
                <th className="p-3.5">Scheduled Duration</th>
                <th className="p-3.5">Room Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {timetable.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5 font-bold text-slate-800">{item.day}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                      {item.className}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-blue-600">{item.subject}</td>
                  <td className="p-3.5 font-semibold text-slate-800">{item.teacherName}</td>
                  <td className="p-3.5 font-mono text-slate-500">{item.startTime} - {item.endTime}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{item.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-VIEW: Library Catalogs */}
      {activeSubTab === "library" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Book Catalog creation */}
          <form onSubmit={handleAddBook} className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 h-fit">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
              Register Library Book
            </h4>
            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-600 mb-1">Book Title Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Advanced Quantum Mechanics"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="David J. Griffiths"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">ISBN Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. ISBN-38291"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Base Quantity</label>
                  <input
                    type="number"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({ ...newBook, quantity: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
              >
                Register Catalog Item
              </button>
            </div>
          </form>

          {/* Books List catalog */}
          <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3.5">Book & Author</th>
                  <th className="p-3.5">ISBN Reference</th>
                  <th className="p-3.5">Availability (Shelves / Borrowed)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {books.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-800 block">{bk.title}</span>
                      <span className="text-[10px] text-slate-400">By: {bk.author}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-500">{bk.isbn}</td>
                    <td className="p-3.5 font-semibold">
                      <span className="block text-slate-800">
                        {bk.quantity - bk.borrowed} copies remaining
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{bk.borrowed} borrowed</span>
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleBorrowBook(bk.id)}
                        disabled={bk.borrowed >= bk.quantity}
                        className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 disabled:opacity-50 py-1 px-2.5 rounded-lg hover:bg-blue-100"
                      >
                        Issue Check-out
                      </button>
                      <button
                        onClick={() => handleReturnBook(bk.id)}
                        disabled={bk.borrowed === 0}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 disabled:opacity-50 py-1 px-2.5 rounded-lg hover:bg-emerald-100"
                      >
                        Return Shelf
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: Assets & Inventory */}
      {activeSubTab === "inventory" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-3.5">Asset / Resource Item Name</th>
                <th className="p-3.5">Category Designation</th>
                <th className="p-3.5">Current Stock Level</th>
                <th className="p-3.5">Registered Vendor</th>
                <th className="p-3.5">Supply Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inventory.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3.5 font-bold text-slate-800">{inv.itemName}</td>
                  <td className="p-3.5 font-semibold text-slate-500">{inv.category}</td>
                  <td className="p-3.5 font-bold text-slate-800">{inv.stock} units</td>
                  <td className="p-3.5 text-slate-600">{inv.supplier}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === "In Stock"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleRestockInventory(inv.id)}
                      className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 py-1 px-2.5 rounded-lg hover:bg-blue-100 transition"
                    >
                      Restock Supplies
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
