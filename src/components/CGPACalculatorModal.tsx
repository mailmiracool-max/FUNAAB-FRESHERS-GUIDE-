import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Award, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Sparkles,
  Save,
  Download,
  Target
} from 'lucide-react';

export interface CourseGradeItem {
  id: string;
  code: string;
  title: string;
  units: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

interface CGPACalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_POINTS_5_SCALE: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F', number> = {
  'A': 5.0,
  'B': 4.0,
  'C': 3.0,
  'D': 2.0,
  'E': 1.0,
  'F': 0.0,
};

const GRADE_POINTS_4_SCALE: Record<'A' | 'B' | 'C' | 'D' | 'E' | 'F', number> = {
  'A': 4.0,
  'B': 3.0,
  'C': 2.0,
  'D': 1.0,
  'E': 0.5,
  'F': 0.0,
};

const DEFAULT_100L_COURSES: CourseGradeItem[] = [
  { id: '1', code: 'CHM 101', title: 'Introductory General Chemistry I', units: 3, grade: 'A' },
  { id: '2', code: 'MTH 101', title: 'Elementary Mathematics I', units: 3, grade: 'A' },
  { id: '3', code: 'PHY 101', title: 'General Physics I', units: 3, grade: 'B' },
  { id: '4', code: 'BIO 101', title: 'General Biology I', units: 3, grade: 'A' },
  { id: '5', code: 'GNS 101', title: 'Use of English & Communication', units: 2, grade: 'A' },
  { id: '6', code: 'AGE 102', title: 'Introductory Agriculture', units: 2, grade: 'B' },
];

export const CGPACalculatorModal: React.FC<CGPACalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = useState<'5.0' | '4.0'>('5.0');
  const [targetGoal, setTargetGoal] = useState<string>('4.50+ First Class');

  const [courses, setCourses] = useState<CourseGradeItem[]>(() => {
    try {
      const saved = localStorage.getItem('funaab_cgpa_courses');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_100L_COURSES;
  });

  const [isAskingGemini, setIsAskingGemini] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUnits, setNewUnits] = useState<number>(3);
  const [newGrade, setNewGrade] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');

  const gradePoints = scale === '5.0' ? GRADE_POINTS_5_SCALE : GRADE_POINTS_4_SCALE;

  const handleAskGemini = async () => {
    setIsAskingGemini(true);
    setAiAdvice(null);
    try {
      const res = await fetch('/api/gemini/cgpa-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses, targetCGPA: targetGoal, scale }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
      } else {
        setAiAdvice('Focus on core 3-credit unit courses (MTH 101, CHM 101, PHY 101). Securing 25+ points in Continuous Assessments (CAs) makes obtaining A grades much easier during final exams!');
      }
    } catch (err) {
      setAiAdvice('Gemini CGPA Advisor: Prioritize 3-unit courses, maintain study consistency at Nimbe Adedipe Library, and participate actively in study group revision sessions.');
    } finally {
      setIsAskingGemini(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('funaab_cgpa_courses', JSON.stringify(courses));
    } catch (e) {}
  }, [courses]);

  if (!isOpen) return null;

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newItem: CourseGradeItem = {
      id: Date.now().toString(),
      code: newCode.toUpperCase().trim(),
      title: newTitle.trim() || 'Course Title',
      units: Number(newUnits) || 3,
      grade: newGrade,
    };

    setCourses([...courses, newItem]);
    setNewCode('');
    setNewTitle('');
    setNewUnits(3);
    setNewGrade('A');
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    if (confirm('Reset to default FUNAAB 100L courses sample?')) {
      setCourses(DEFAULT_100L_COURSES);
    }
  };

  // Calculations
  const totalUnits = courses.reduce((sum, c) => sum + Number(c.units), 0);
  const totalGradePoints = courses.reduce((sum, c) => sum + (Number(c.units) * gradePoints[c.grade]), 0);
  const cgpa = totalUnits > 0 ? Number((totalGradePoints / totalUnits).toFixed(2)) : 0.00;

  const getDegreeClassification = (gpa: number) => {
    if (scale === '5.0') {
      if (gpa >= 4.50) return { title: 'First Class Honours (1st)', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300' };
      if (gpa >= 3.50) return { title: 'Second Class Upper (2:1)', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-300' };
      if (gpa >= 2.40) return { title: 'Second Class Lower (2:2)', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-300' };
      if (gpa >= 1.50) return { title: 'Third Class Honours (3rd)', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-300' };
      if (gpa >= 1.00) return { title: 'Pass Degree', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 border-orange-300' };
      return { title: 'Academic Probation', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-300' };
    } else {
      if (gpa >= 3.50) return { title: 'First Class Honours', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300' };
      if (gpa >= 3.00) return { title: 'Second Class Upper (2:1)', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-300' };
      if (gpa >= 2.00) return { title: 'Second Class Lower (2:2)', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-300' };
      if (gpa >= 1.00) return { title: 'Third Class Honours', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-300' };
      return { title: 'Academic Probation', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-300' };
    }
  };

  const classification = getDegreeClassification(cgpa);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-modal-backdrop">
      <div 
        className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cgpa-calculator-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 id="cgpa-calculator-title" className="text-base sm:text-lg font-bold">
                FUNAAB CGPA & Grade Advisor
              </h3>
              <p className="text-xs text-emerald-200">
                Official FUNAAB 5.0 Point Scale (A=5, B=4, C=3, D=2, E=1, F=0) & Gemini AI Target Planner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scale Switcher & Target Goal Selector */}
        <div className="px-6 py-3 bg-emerald-950 text-white border-b border-emerald-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-200">Grading System:</span>
            <button
              onClick={() => setScale('5.0')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                scale === '5.0'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-emerald-800/60 text-emerald-200 hover:text-white'
              }`}
            >
              5.0 Scale (FUNAAB)
            </button>
            <button
              onClick={() => setScale('4.0')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                scale === '4.0'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-emerald-800/60 text-emerald-200 hover:text-white'
              }`}
            >
              4.0 Scale
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-emerald-200">Target Goal:</span>
            <select
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="bg-emerald-900 border border-emerald-700 text-amber-300 font-bold rounded-lg px-2 py-0.5"
            >
              <option value="4.50+ First Class">4.50+ First Class</option>
              <option value="3.50+ 2:1 Upper">3.50+ 2:1 Upper</option>
              <option value="2.40+ 2:2 Lower">2.40+ 2:2 Lower</option>
            </select>
          </div>
        </div>

        {/* CGPA Summary Cards */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Cumulative CGPA
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {cgpa.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">/ {scale} Scale</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Total Units
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalUnits}
            </span>
            <span className="text-[10px] text-slate-400">Credit Units</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Grade Points
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
              {totalGradePoints}
            </span>
            <span className="text-[10px] text-slate-400">Total Points</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Scale Values
            </span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
              {scale === '5.0' ? 'A=5|B=4|C=3|D=2|E=1|F=0' : 'A=4|B=3|C=2|D=1|E=0.5|F=0'}
            </span>
          </div>
        </div>

        {/* Degree Classification Banner & Gemini AI Advisor */}
        <div className="mx-4 sm:mx-6 mt-4 flex flex-col gap-2.5">
          <div className={`p-3 rounded-2xl border flex items-center justify-between ${classification.color}`}>
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                  Projected FUNAAB Degree Class ({scale} Scale):
                </span>
                <h4 className="text-xs sm:text-sm font-black">
                  {classification.title}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAskGemini}
                disabled={isAskingGemini}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
                title="Get AI CGPA target advice from Gemini"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{isAskingGemini ? 'Analyzing...' : 'Ask Gemini Advisor'}</span>
              </button>

              <button
                onClick={handleReset}
                title="Reset to default 100L courses"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition flex items-center gap-1 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Gemini AI Advice Box */}
          {aiAdvice && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/90 to-teal-900/90 text-white text-xs shadow-lg border border-emerald-500/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  Gemini Academic Advisor Strategy (FUNAAB)
                </span>
                <button
                  onClick={() => setAiAdvice(null)}
                  className="text-white/70 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="whitespace-pre-line leading-relaxed text-emerald-100">
                {aiAdvice}
              </p>
            </div>
          )}
        </div>

        {/* Body: Course List & Add Form */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Add Course Form */}
          <form onSubmit={handleAddCourse} className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              Add Course & Expected Grade
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Code e.g. CHM 101"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Title e.g. General Chemistry"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <select
                  value={newUnits}
                  onChange={(e) => setNewUnits(Number(e.target.value))}
                  className="w-full px-2 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>1 Unit</option>
                  <option value={2}>2 Units</option>
                  <option value={3}>3 Units</option>
                  <option value={4}>4 Units</option>
                  <option value={5}>5 Units</option>
                  <option value={6}>6 Units</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' | 'F')}
                  className="w-full px-2 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="A">Grade A (70%+)</option>
                  <option value="B">Grade B (60-69%)</option>
                  <option value="C">Grade C (50-59%)</option>
                  <option value="D">Grade D (45-49%)</option>
                  <option value="E">Grade E (40-44%)</option>
                  <option value="F">Grade F (0-39%)</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <button
                  type="submit"
                  className="w-full h-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center transition shadow"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Courses Table / List */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Registered Courses ({courses.length})
            </h4>

            {courses.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                No courses added yet. Add your 100L or 200L courses above to calculate your CGPA.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {courses.map((course) => {
                  const gp = gradePoints[course.grade];
                  return (
                    <div key={course.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black font-mono text-center flex-shrink-0">
                          {course.grade}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {course.code} • <span className="font-normal text-slate-600 dark:text-slate-300">{course.title}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {course.units} Unit{course.units > 1 ? 's' : ''} • Grade Pt: {gp.toFixed(1)} • Total: {course.units * gp} pts
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Remove course"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>FUNAAB System ({scale === '5.0' ? 'A=5, B=4, C=3, D=2, E=1, F=0' : 'A=4, B=3, C=2, D=1, F=0'})</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
