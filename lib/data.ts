export interface Transaction {
  id: number
  date: string
  desc: string
  note: string
  type: 'income' | 'expense'
  category: string
  amount: number
}

export const SEED_DATA: Transaction[] = [
  { id:1, date:'2026-04-04', desc:'Monthly Salary', note:'Full-time job', type:'income', category:'Salary', amount:5200 },
  { id:2, date:'2026-04-03', desc:'Grocery run', note:'Whole Foods', type:'expense', category:'Food', amount:142.50 },
  { id:3, date:'2026-04-02', desc:'Uber ride', note:'To airport', type:'expense', category:'Transport', amount:34.80 },
  { id:4, date:'2026-04-01', desc:'Netflix', note:'Monthly plan', type:'expense', category:'Entertainment', amount:15.99 },
  { id:5, date:'2026-04-01', desc:'Electricity bill', note:'April bill', type:'expense', category:'Utilities', amount:89.00 },
  { id:6, date:'2026-03-29', desc:'Freelance project', note:'Web design', type:'income', category:'Freelance', amount:800 },
  { id:7, date:'2026-03-27', desc:'Restaurant dinner', note:'With family', type:'expense', category:'Food', amount:78.40 },
  { id:8, date:'2026-03-25', desc:'Amazon shopping', note:'Electronics', type:'expense', category:'Shopping', amount:249.99 },
  { id:9, date:'2026-03-24', desc:'Gym membership', note:'Monthly', type:'expense', category:'Health', amount:45.00 },
  { id:10, date:'2026-03-23', desc:'Stock dividend', note:'AAPL', type:'income', category:'Investment', amount:320 },
  { id:11, date:'2026-03-22', desc:'Internet bill', note:'Fiber plan', type:'expense', category:'Utilities', amount:59.99 },
  { id:12, date:'2026-03-20', desc:'Coffee shop', note:'Daily habit', type:'expense', category:'Food', amount:22.50 },
  { id:13, date:'2026-03-19', desc:'Bus pass', note:'Monthly', type:'expense', category:'Transport', amount:70 },
  { id:14, date:'2026-03-18', desc:'Online course', note:'React dev', type:'expense', category:'Education', amount:49 },
  { id:15, date:'2026-03-17', desc:'Salary bonus', note:'Q1 bonus', type:'income', category:'Salary', amount:1000 },
  { id:16, date:'2026-03-15', desc:'Rent payment', note:'March rent', type:'expense', category:'Rent', amount:1200 },
  { id:17, date:'2026-03-12', desc:'Doctor visit', note:'Annual check', type:'expense', category:'Health', amount:85 },
  { id:18, date:'2026-03-10', desc:'Flight tickets', note:'Summer trip', type:'expense', category:'Travel', amount:380 },
  { id:19, date:'2026-03-08', desc:'Spotify', note:'Family plan', type:'expense', category:'Entertainment', amount:14.99 },
  { id:20, date:'2026-03-05', desc:'Freelance design', note:'Logo work', type:'income', category:'Freelance', amount:450 },
  { id:21, date:'2026-03-04', desc:'Monthly Salary', note:'Full-time job', type:'income', category:'Salary', amount:5200 },
  { id:22, date:'2026-03-02', desc:'Water bill', note:'February', type:'expense', category:'Utilities', amount:32.00 },
  { id:23, date:'2026-02-28', desc:'New shoes', note:'Nike store', type:'expense', category:'Shopping', amount:120 },
  { id:24, date:'2026-02-25', desc:'Stock dividend', note:'MSFT', type:'income', category:'Investment', amount:280 },
  { id:25, date:'2026-02-20', desc:'Grocery run', note:"Trader Joe's", type:'expense', category:'Food', amount:98.30 },
  { id:26, date:'2026-02-18', desc:'Rent payment', note:'February rent', type:'expense', category:'Rent', amount:1200 },
  { id:27, date:'2026-02-15', desc:'Pharmacy', note:'Medicine', type:'expense', category:'Health', amount:28.50 },
  { id:28, date:'2026-02-12', desc:'Book store', note:'Programming books', type:'expense', category:'Education', amount:65 },
  { id:29, date:'2026-02-10', desc:'Freelance report', note:'Data analysis', type:'income', category:'Freelance', amount:600 },
  { id:30, date:'2026-02-04', desc:'Monthly Salary', note:'Full-time job', type:'income', category:'Salary', amount:5200 },
]

export const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 
  'Health', 'Salary', 'Freelance', 'Investment', 'Rent', 
  'Education', 'Travel', 'Other'
]

export const CAT_COLORS: Record<string, string> = {
  Food: '#f08080', Transport: '#7ab0f0', Entertainment: '#c0a0f0',
  Utilities: '#f0c878', Shopping: '#f09090', Health: '#80d4b8',
  Salary: '#60c4a0', Freelance: '#7ab0f0', Investment: '#b090e8',
  Rent: '#e8b860', Education: '#6cc8b0', Travel: '#70a8e8', Other: '#a0a098'
}

// Formatting helpers
export const fmt = (v: number) => '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtShort = (v: number) => '$' + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })

export const pct = (a: number, b: number) => {
  if (!b) return '—'
  const d = ((a - b) / b * 100).toFixed(1)
  return (Number(d) > 0 ? '+' : '') + d + '%'
}
