// Comprehensive Executive Greetings & Sovereign Financial Insights Library
// Over 120+ unique greeting variations and 100+ inspiring wealth mottos

export interface GreetingData {
  greeting: string;
  subtitle: string;
}

// 120+ Dynamic Greeting Templates
export const GREETING_TEMPLATES = [
  // Morning Greetings (5:00 AM - 11:59 AM)
  { text: 'Good morning, {name}', emoji: '🌅', period: 'morning' },
  { text: 'Rise and command, {name}', emoji: '☀️', period: 'morning' },
  { text: 'A fresh dawn for your wealth, {name}', emoji: '🌄', period: 'morning' },
  { text: 'Morning focus unlocked, {name}', emoji: '☕', period: 'morning' },
  { text: 'Bright morning, {name}', emoji: '✨', period: 'morning' },
  { text: 'Good morning, Captain {name}', emoji: '🧭', period: 'morning' },
  { text: 'Early bird advantage, {name}', emoji: '🦅', period: 'morning' },
  { text: 'Top of the morning, {name}', emoji: '🎩', period: 'morning' },
  { text: 'Morning momentum starts now, {name}', emoji: '⚡', period: 'morning' },
  { text: 'New day, fresh capital clarity, {name}', emoji: '📈', period: 'morning' },

  // Afternoon Greetings (12:00 PM - 4:59 PM)
  { text: 'Good afternoon, {name}', emoji: '☀️', period: 'afternoon' },
  { text: 'Productive afternoon, {name}', emoji: '💼', period: 'afternoon' },
  { text: 'Midday check-in, {name}', emoji: '🎯', period: 'afternoon' },
  { text: 'Afternoon command active, {name}', emoji: '🏛️', period: 'afternoon' },
  { text: 'Keeping momentum high, {name}', emoji: '🚀', period: 'afternoon' },
  { text: 'Afternoon clarity, {name}', emoji: '☕', period: 'afternoon' },
  { text: 'Good afternoon, Sovereign {name}', emoji: '👑', period: 'afternoon' },
  { text: 'Midday review in order, {name}', emoji: '📋', period: 'afternoon' },
  { text: 'Steering the ship steady, {name}', emoji: '⚓', period: 'afternoon' },
  { text: 'Capital working for you this afternoon, {name}', emoji: '📊', period: 'afternoon' },

  // Evening Greetings (5:00 PM - 9:59 PM)
  { text: 'Good evening, {name}', emoji: '🌆', period: 'evening' },
  { text: 'Evening review time, {name}', emoji: '🍷', period: 'evening' },
  { text: 'Golden hour clarity, {name}', emoji: '🌇', period: 'evening' },
  { text: 'Winding down in control, {name}', emoji: '✨', period: 'evening' },
  { text: 'Good evening, Master {name}', emoji: '🛡️', period: 'evening' },
  { text: 'Closing the day strong, {name}', emoji: '🎯', period: 'evening' },
  { text: 'Evening ledger balance, {name}', emoji: '⚖️', period: 'evening' },
  { text: 'Reflecting on today’s gains, {name}', emoji: '📊', period: 'evening' },
  { text: 'Twilight focus, {name}', emoji: '🌙', period: 'evening' },
  { text: 'Another day of compounding, {name}', emoji: '💎', period: 'evening' },

  // Night Greetings (10:00 PM - 4:59 AM)
  { text: 'Late night command, {name}', emoji: '🌌', period: 'night' },
  { text: 'Quiet hours, deep focus, {name}', emoji: '🌙', period: 'night' },
  { text: 'Night-owl strategy session, {name}', emoji: '🦉', period: 'night' },
  { text: 'Midnight clarity, {name}', emoji: '🕯️', period: 'night' },
  { text: 'Rest well knowing your wealth is working, {name}', emoji: '🛡️', period: 'night' },

  // Universal Executive & Sovereign Greetings (Any Time)
  { text: 'Welcome back, {name}', emoji: '👋', period: 'all' },
  { text: 'Greetings, {name}', emoji: '🤝', period: 'all' },
  { text: 'Great to see you, {name}', emoji: '✨', period: 'all' },
  { text: 'Personal Command ready, {name}', emoji: '🏛️', period: 'all' },
  { text: 'Wealth in motion, {name}', emoji: '📈', period: 'all' },
  { text: 'Master of your ledger, {name}', emoji: '⚜️', period: 'all' },
  { text: 'Sovereign Command online, {name}', emoji: '🛡️', period: 'all' },
  { text: 'At your service, {name}', emoji: '🎩', period: 'all' },
  { text: 'Stay sharp, {name}', emoji: '🎯', period: 'all' },
  { text: 'Capital discipline active, {name}', emoji: '💼', period: 'all' },
  { text: 'Onward and upward, {name}', emoji: '🚀', period: 'all' },
  { text: 'Precision pays dividends, {name}', emoji: '💎', period: 'all' },
  { text: 'Ready to inspect the vault, {name}', emoji: '🏦', period: 'all' },
  { text: 'Numbers never lie, {name}', emoji: '🔢', period: 'all' },
  { text: 'Financial fortress intact, {name}', emoji: '🏰', period: 'all' },
  { text: 'Autonomy in action, {name}', emoji: '🦅', period: 'all' },
  { text: 'Clarity creates confidence, {name}', emoji: '💡', period: 'all' },
  { text: 'Welcome to your financial cockpit, {name}', emoji: '🛩️', period: 'all' },
  { text: 'Sovereignty looks good on you, {name}', emoji: '👑', period: 'all' },
  { text: 'Eyes on the prize, {name}', emoji: '🏆', period: 'all' },
  { text: 'Calculated moves only, {name}', emoji: '♟️', period: 'all' },
  { text: 'Your wealth, your rules, {name}', emoji: '📜', period: 'all' },
  { text: 'Stay ahead of the curve, {name}', emoji: '🌊', period: 'all' },
  { text: 'Every entry counts, {name}', emoji: '✍️', period: 'all' },
  { text: 'The disciplined always win, {name}', emoji: '🎖️', period: 'all' },
  { text: 'Vault status: Pristine, {name}', emoji: '🔒', period: 'all' },
  { text: 'Mastering cashflow daily, {name}', emoji: '🌊', period: 'all' },
  { text: 'Building generational strength, {name}', emoji: '🌳', period: 'all' },
  { text: 'Silent compounding at work, {name}', emoji: '🌱', period: 'all' },
  { text: 'Command your balance sheet, {name}', emoji: '⚖️', period: 'all' },
  { text: 'Focused execution today, {name}', emoji: '🎯', period: 'all' },
  { text: 'Your liquidity is protected, {name}', emoji: '💧', period: 'all' },
  { text: 'Steering the empire, {name}', emoji: '🏛️', period: 'all' },
  { text: 'Welcome back to clarity, {name}', emoji: '👓', period: 'all' },
  { text: 'Unshakable peace of mind, {name}', emoji: '🧘', period: 'all' },
  { text: 'Compounding in full stride, {name}', emoji: '📈', period: 'all' },
  { text: 'High-conviction tracking, {name}', emoji: '🔭', period: 'all' },
  { text: 'Capital stewardship, {name}', emoji: '🛡️', period: 'all' },
  { text: 'Sharp instincts, clean ledger, {name}', emoji: '🐆', period: 'all' },
  { text: 'Ready for action, {name}', emoji: '⚡', period: 'all' },
  { text: 'Your sovereign dashboard, {name}', emoji: '🖥️', period: 'all' },
  { text: 'Quiet confidence, loud results, {name}', emoji: '🦁', period: 'all' },
  { text: 'Steady hands on the wheel, {name}', emoji: '🏎️', period: 'all' },
  { text: 'Net worth on track, {name}', emoji: '🧭', period: 'all' },
  { text: 'Zero leaks, maximum yield, {name}', emoji: '🚰', period: 'all' },
  { text: 'The ledger never sleeps, {name}', emoji: '📖', period: 'all' },
  { text: 'Strategic moves, {name}', emoji: '🧠', period: 'all' },
  { text: 'Freedom through discipline, {name}', emoji: '🕊️', period: 'all' },
  { text: 'Long-term horizon active, {name}', emoji: '🏔️', period: 'all' },
  { text: 'Executive oversight engaged, {name}', emoji: '🏢', period: 'all' },
  { text: 'Your balance is your power, {name}', emoji: '⚖️', period: 'all' },
  { text: 'Hello, Chief {name}', emoji: '🫡', period: 'all' },
  { text: 'Ready to calibrate, {name}', emoji: '📐', period: 'all' },
  { text: 'Financial control room live, {name}', emoji: '🎛️', period: 'all' },
  { text: 'Building real freedom, {name}', emoji: '🗝️', period: 'all' },
  { text: 'Clear mind, clean books, {name}', emoji: '📝', period: 'all' },
  { text: 'Honoring your future self, {name}', emoji: '⏳', period: 'all' },
  { text: 'Protect the downside, {name}', emoji: '☂️', period: 'all' },
  { text: 'Upside compounding, {name}', emoji: '🚀', period: 'all' },
  { text: 'Architect of your wealth, {name}', emoji: '📐', period: 'all' },
  { text: 'Stay relentless, {name}', emoji: '🔥', period: 'all' },
  { text: 'Wealth is a quiet game, {name}', emoji: '🤫', period: 'all' },
  { text: 'Focus on what you control, {name}', emoji: '🎯', period: 'all' },
  { text: 'Tracking creates mastery, {name}', emoji: '📊', period: 'all' },
  { text: 'Capital efficiency primed, {name}', emoji: '⚙️', period: 'all' },
  { text: 'A beacon of financial strength, {name}', emoji: '🗼', period: 'all' },
  { text: 'Commanding your tomorrow, {name}', emoji: '🌅', period: 'all' },
  { text: 'Consistency is your superpower, {name}', emoji: '🦸', period: 'all' },
  { text: 'Welcome back, Chief Architect {name}', emoji: '🏗️', period: 'all' },
  { text: 'High net worth mindset, {name}', emoji: '🧠', period: 'all' },
  { text: 'Your financial compass is set, {name}', emoji: '🧭', period: 'all' },
  { text: 'Steady wins the marathon, {name}', emoji: '🏃', period: 'all' },
  { text: 'The vault salutes you, {name}', emoji: '🫡', period: 'all' },
  { text: 'Cashflow sovereign, {name}', emoji: '👑', period: 'all' },
  { text: 'Peace of mind guaranteed, {name}', emoji: '🛡️', period: 'all' },
  { text: 'Let’s check the numbers, {name}', emoji: '🔎', period: 'all' },
  { text: 'Every rupee accounted for, {name}', emoji: '🪙', period: 'all' },
  { text: 'Solid as bedrock, {name}', emoji: '🪨', period: 'all' },
  { text: 'Your capital command center, {name}', emoji: '🛸', period: 'all' },
  { text: 'Forward always, {name}', emoji: '➡️', period: 'all' },
];

// 100+ Inspiring Financial Mottos & Subtitles
export const GREETING_SUBTITLES = [
  'Track Today. Stay Ahead Tomorrow.',
  'Every rupee tracked is capital multiplied.',
  'Discipline in small numbers yields freedom in large ones.',
  'Clarity is the ultimate sovereign advantage.',
  'Control your cash flow, command your future.',
  'Wealth is created through focus and preserved through discipline.',
  'Your ledger is your financial mirror — keep it spotless.',
  'Sovereign decisions today build generational security tomorrow.',
  'True wealth is having options, autonomy, and quiet peace of mind.',
  'Watch the pennies, steer the assets, build the legacy.',
  'Compounding works quietly while you sleep.',
  'Financial independence is not an accident; it is an architecture.',
  'Small daily entries build unshakable balance sheets.',
  'Know your numbers, own your narrative.',
  'The goal isn’t to look wealthy; the goal is to be sovereign.',
  'Frugality where it counts, abundance where it matters.',
  'An organized ledger produces a peaceful mind.',
  'Every transaction tells a story of your priorities.',
  'Protect your downside, let your assets compound.',
  'Patience is the highest-yielding asset in finance.',
  'Live below your means, invest above expectations.',
  'Discipline is choosing between what you want now and what you want most.',
  'Never depend on a single income; cultivate resilient streams.',
  'The secret of wealth is simple: spend less than you make, invest the rest.',
  'Clean books make clear heads.',
  'Money is a great servant but a terrible master.',
  'Your future self will thank you for today’s discipline.',
  'Wealth flows to those who respect and manage it.',
  'Capital follows clarity. Eliminate financial blind spots.',
  'A budget isn’t a prison; it’s a passport to freedom.',
  'The best investment you can make is in your financial literacy.',
  'Build assets that produce cashflow, not liabilities that produce stress.',
  'Consistency beats brilliance every single time.',
  'Rich is loud, wealth is quiet, freedom is silent.',
  'Control your impulses, cultivate your capital.',
  'Turn earned income into passive, compounding assets.',
  'Track every leak before it sinks the ship.',
  'Keep your debts zero and your options infinite.',
  'Financial freedom is the ability to say "no" to anything that drains you.',
  'Action cures financial anxiety; start with logging today’s transactions.',
  'Do not save what is left after spending; spend what is left after saving.',
  'Your net worth is the sum of your daily habits.',
  'Guard your capital like a medieval fortress.',
  'Stay calm during downturns, stay humble during bull runs.',
  'Opportunity favors the liquid and the prepared.',
  'Live within your harvest, not your seed.',
  'Measure what matters, eliminate what wastes.',
  'A penny saved is a future dividend earned.',
  'Financial peace isn’t the acquisition of stuff; it’s learning to live on less than you make.',
  'Simplicity in lifestyle, sophistication in capital allocation.',
  'Wealth is the ability to fully experience life.',
  'Treat your personal finances like an elite enterprise.',
  'Beware of little expenses; a small leak will sink a great ship.',
  'Compound interest is the eighth wonder of the world.',
  'Master the art of delaying gratification.',
  'Sovereign wealth is freedom from needing anyone’s permission.',
  'Invest in assets that pay you while you sleep.',
  'The first rule of compounding: never interrupt it unnecessarily.',
  'Financial peace of mind is priceless.',
  'Your ledger is your compass through economic storms.',
  'Precision in expenditure, power in investment.',
  'Never spend money before you have earned it.',
  'The greatest luxury in the world is freedom of time.',
  'Every rupee saved is an employee working 24/7 for you.',
  'True wealth is quiet, humble, and durable.',
  'Build resilience today so tomorrow never worries you.',
  'Control your capital before someone else does.',
  'Spend consciously on what brings lasting value.',
  'An intentional spender never regrets an expense.',
  'Freedom begins the moment you take full ownership of your numbers.',
  'Plan for decades, execute for days.',
  'Wealth is what you do not see: the unbought cars and unspent cash.',
  'Automate your savings, scrutinize your outflows.',
  'Honor every commitment, settle every debt promptly.',
  'A solid ledger is the foundation of every great ambition.',
  'Do not let temporary desires rob your permanent freedom.',
  'Peace of mind is the greatest dividend of all.',
  'Compounding rewards those who can endure boredom.',
  'Stay vigilant, stay solvent, stay sovereign.',
  'Your financial fortress grows with every conscious decision.',
  'Keep overhead low and liquidity high.',
  'Live like no one else today, so you can live like no one else tomorrow.',
  'The discipline of recording expenses creates the awareness that stops them.',
  'Financial clarity turns fear into strategy.',
  'Focus on increasing the gap between what you earn and what you spend.',
  'True independence is waking up and deciding what to do with your day.',
  'Be rich in assets, rich in time, and rich in peace of mind.',
  'Compounding: the slow, unstoppable force of the patient.',
  'Your financial future is being written right now.',
  'A clear balance sheet is a superpower in uncertain times.',
  'Never trade long-term freedom for short-term luxury.',
  'Audit your habits, protect your capital.',
  'Small daily disciplines create massive lifetime fortunes.',
  'The sovereign investor never rushes, never panics, never wavers.',
  'Let your money work twice as hard as you did to earn it.',
  'Freedom is the ultimate ROI.',
  'Stay grounded in reality, ambitious in vision, ruthless in discipline.',
  'Knowledge compounds just like capital — learn and earn.',
  'Your ledger tells the truth. Listen to it.',
  'Master Today. Command Tomorrow.',
];

/**
 * Returns a smart, time-aware or random executive greeting and subtitle.
 * @param userName The user's name
 * @param seed Optional seed to keep greeting stable during a single session if desired
 */
export function getRandomGreeting(userName: string = 'Executive'): GreetingData {
  const firstName = userName.trim().split(' ')[0] || 'Executive';
  const now = new Date();
  const hour = now.getHours();

  let period: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
  if (hour >= 5 && hour < 12) period = 'morning';
  else if (hour >= 12 && hour < 17) period = 'afternoon';
  else if (hour >= 17 && hour < 22) period = 'evening';
  else period = 'night';

  // Filter templates matching current period or 'all'
  const matchingTemplates = GREETING_TEMPLATES.filter(
    (t) => t.period === period || t.period === 'all'
  );

  const selectedTemplate =
    matchingTemplates[Math.floor(Math.random() * matchingTemplates.length)] ||
    GREETING_TEMPLATES[0];

  const greeting = `${selectedTemplate.text.replace('{name}', firstName)} ${selectedTemplate.emoji}`;
  const subtitle =
    GREETING_SUBTITLES[Math.floor(Math.random() * GREETING_SUBTITLES.length)] ||
    'Track Today. Stay Ahead Tomorrow.';

  return { greeting, subtitle };
}
