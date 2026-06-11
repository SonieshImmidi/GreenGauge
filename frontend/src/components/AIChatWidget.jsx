import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RiRobot2Line, RiCloseLine, RiSendPlaneLine,
  RiLeafLine, RiRefreshLine, RiQuestionLine,
} from 'react-icons/ri';

// ── Knowledge base for contextual responses ────────────────────────────
const KB = [
  {
    patterns: ['hello', 'hi', 'hey', 'greet', 'good morning', 'good evening'],
    response: () => "Hello! 👋 I'm **GreenBot**, your eco assistant.\n\nI can help you:\n- 🧮 Understand your carbon footprint\n- 📊 Navigate the dashboard\n- 💡 Get personalized eco tips\n- 🌿 Learn about emission reductions\n\nWhat would you like to know?",
  },
  {
    patterns: ['carbon footprint', 'what is carbon', 'co2', 'emission', 'carbon mean'],
    response: () => "🌍 **Carbon Footprint** is the total amount of greenhouse gases — primarily CO₂ — you produce through your daily activities.\n\n**Main sources:**\n- 🚗 Transport (car, flights)\n- ⚡ Home energy use\n- 🥩 Food choices (meat is high)\n- 🛍️ Shopping & manufacturing\n\nThe **global average** is ~4.7 tonnes/person/year. The safe limit is ~2 tonnes. Use the calculator on the home page to check yours!",
  },
  {
    patterns: ['reduce', 'lower', 'cut', 'decrease', 'improve', 'tip', 'advice', 'how to'],
    response: () => "♻️ **Top ways to reduce your carbon footprint:**\n\n1. **🚗 Drive less** — walk, cycle or use public transport\n2. **✈️ Fly less** — one flight can equal months of driving\n3. **🥦 Eat less meat** — go plant-based 2-3 days/week\n4. **💡 Switch to renewables** — LED lights, solar energy\n5. **🛍️ Buy less, buy used** — fast fashion has huge emissions\n6. **🌡️ Insulate your home** — reduces heating/cooling energy\n\nCheck the **Recommendations** page for personalized tips!",
  },
  {
    patterns: ['dashboard', 'how to use', 'navigate', 'where', 'find'],
    response: () => "📊 **Here's how to use GreenGauge:**\n\n- **Dashboard** — Your overview with charts and CO₂ score\n- **Calculator** → Log a new activity entry\n- **History** → See all past entries and trends\n- **Recommendations** → AI-powered personalized tips\n- **Profile** → Update your settings\n\nAll pages are accessible from the left sidebar (desktop) or the top menu.",
  },
  {
    patterns: ['calculator', 'log', 'track', 'record', 'entry', 'add'],
    response: () => "🧮 **To log your carbon footprint:**\n\n1. Go to **Calculator** in the sidebar\n2. Fill in your activities:\n   - Transportation (km driven, flights)\n   - Energy (electricity, gas usage)\n   - Food (meat meals, dairy)\n   - Shopping (clothes, electronics)\n3. Click **Calculate** — your CO₂ is computed instantly\n4. The entry is saved to your **History** automatically\n\nTip: Try the **Quick Calculator** on the home page for a fast estimate!",
  },
  {
    patterns: ['history', 'past', 'previous', 'old', 'record'],
    response: () => "📅 **Your History page** shows all logged carbon entries.\n\nYou can:\n- 📈 See trends over time\n- 🔍 Filter by date or category\n- 📥 Export data as CSV or PDF\n- ♻️ Compare months\n\nThe chart shows your **monthly emissions trend** so you can see if you're improving!",
  },
  {
    patterns: ['recommendation', 'suggest', 'advice', 'ai tip', 'smart'],
    response: () => "🤖 **Recommendations** are personalized based on your logged data.\n\nThe more you log, the smarter the suggestions get! They cover:\n- 🚗 Commuting alternatives\n- 🍽️ Diet swaps\n- 🏠 Home energy efficiency\n- 🛒 Sustainable shopping\n\nVisit the **Recommendations** page to see yours!",
  },
  {
    patterns: ['login', 'sign in', 'account', 'password', 'forgot'],
    response: () => "🔐 **Account help:**\n\n- **Sign In** — go to the Login page, enter email + password\n- **New user** — click 'Get Started Free' to register\n- **Forgot password** — contact support (reset feature coming soon)\n\n**Security note:** Your data is encrypted and never shared. Passwords are hashed using bcrypt.",
  },
  {
    patterns: ['flight', 'plane', 'travel', 'aviation'],
    response: () => "✈️ **Aviation & Carbon:**\n\nFlights are one of the biggest individual carbon sources:\n- Short-haul flight (~2h): **~0.25 tonnes CO₂**\n- Long-haul flight (~10h): **~1.5 tonnes CO₂**\n\n**To offset flying:**\n- Take trains where possible (90% less CO₂!)\n- Offset flights via certified schemes\n- Fly economy (business class = 3x more per seat)\n- Video call instead of business travel",
  },
  {
    patterns: ['food', 'diet', 'meat', 'vegetarian', 'vegan', 'eat'],
    response: () => "🥩 **Food & Emissions:**\n\nYour diet contributes ~25-30% of your footprint.\n\n**CO₂ per kg of food (approx):**\n| Food | CO₂ kg |\n|------|--------|\n| Beef | 27 kg |\n| Chicken | 6.9 kg |\n| Tofu | 2 kg |\n| Vegetables | 0.4 kg |\n\n**Easy wins:** swap 2 meat meals/week for plant-based → save ~200kg CO₂/year!",
  },
  {
    patterns: ['energy', 'electricity', 'solar', 'renewable', 'power'],
    response: () => "⚡ **Home Energy & Carbon:**\n\nEnergy use is typically 20-30% of your footprint.\n\n**Quick wins:**\n- 💡 Switch to LED bulbs (75% less energy)\n- 🌡️ Lower thermostat by 1°C → saves ~10% heating\n- ☀️ Consider rooftop solar\n- 🔌 Unplug standby devices (saves ~10% electricity)\n- 🌬️ Switch to a renewable energy tariff",
  },
  {
    patterns: ['tree', 'plant', 'forest', 'offset', 'sequester'],
    response: () => "🌳 **Trees & Carbon Sequestration:**\n\nOne mature tree absorbs ~22 kg CO₂/year.\nTo offset the average person's footprint (4.7t), you'd need **~213 trees** growing for a year!\n\n**Better than planting trees:** Reduce emissions first, then offset unavoidable ones via certified schemes like:\n- Gold Standard\n- Verra (Verified Carbon Standard)\n- Cool Effect",
  },
  {
    patterns: ['help', 'support', 'contact', 'problem', 'issue', 'bug'],
    response: () => "🛠️ **Need help?**\n\nFor technical issues:\n- Check that you're **logged in**\n- Try **refreshing the page**\n- Clear browser cache if things look wrong\n\nFor feature requests or bugs, reach out via the GitHub repo or social links in the footer.\n\nI'm always here to answer questions about carbon tracking! 🌿",
  },
  {
    patterns: ['thank', 'thanks', 'great', 'good', 'awesome', 'nice'],
    response: () => "🌱 You're welcome! Every small action counts.\n\n*\"The Earth does not belong to us, we belong to the Earth.\"*\n\nKeep tracking, keep reducing! 💚",
  },
];

function findResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const item of KB) {
    if (item.patterns.some((p) => lower.includes(p))) {
      return item.response();
    }
  }
  return "🤔 I'm not sure about that one! Try asking about:\n\n- **Carbon footprint** calculations\n- **How to reduce** your emissions\n- **Dashboard** navigation\n- **Food, flights, or energy** emissions\n\nOr visit the full **Calculator** page for detailed tracking!";
}

// Renders markdown-ish text with bold (**text**) support
function MessageText({ text }) {
  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        // Bold replacement
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={i} style={{ marginBottom: line === '' ? 4 : 0 }}>
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} style={{ color: 'var(--color-primary)' }}>{part}</strong>
                : <span key={j}>{part}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0' }} aria-label="GreenBot is typing">
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--color-primary)',
          animation: `botBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  'How do I reduce my footprint?',
  'What is a carbon footprint?',
  'How to use the calculator?',
  'Tips for flying less?',
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "👋 Hi! I'm **GreenBot**, your eco assistant.\n\nAsk me anything about carbon footprints, how to use GreenGauge, or sustainability tips!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: 'user', text: trimmed, time: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate natural response delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = findResponse(trimmed);
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: response, time: new Date() }]);
      setTyping(false);
      if (!open) setHasUnread(true);
    }, delay);
  }, [input, open]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const handleClear = () => {
    setMessages([{
      id: Date.now(),
      from: 'bot',
      text: "Chat cleared! 🌿 How can I help you with your sustainability journey?",
      time: new Date(),
    }]);
  };

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* ── Bounce animation keyframes ── */}
      <style>{`
        @keyframes botBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes widgetPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(0,255,136,0); }
        }
      `}</style>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          role="dialog"
          aria-label="GreenBot AI Assistant"
          aria-modal="true"
          style={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 360,
            maxWidth: 'calc(100vw - 48px)',
            height: 520,
            maxHeight: 'calc(100vh - 120px)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), var(--shadow-glow)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            animation: 'chatSlideUp 0.25s ease',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0,255,136,0.04)',
            flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }} aria-hidden="true">
              <RiRobot2Line size={20} color="#0a0f0d" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>GreenBot</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} aria-hidden="true" />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Online · Eco AI Assistant</span>
              </div>
            </div>
            <button
              onClick={handleClear}
              title="Clear conversation"
              aria-label="Clear conversation"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <RiRefreshLine size={16} />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <RiCloseLine size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
              }}>
                {/* Avatar */}
                {msg.from === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }} aria-hidden="true">
                    <RiLeafLine size={14} color="#0a0f0d" />
                  </div>
                )}
                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.from === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    background: msg.from === 'user'
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                      : 'rgba(255,255,255,0.06)',
                    border: msg.from === 'bot' ? '1px solid var(--border-color)' : 'none',
                    color: msg.from === 'user' ? '#0a0f0d' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}>
                    <MessageText text={msg.text} />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0 4px' }}>
                    {formatTime(msg.time)}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }} aria-hidden="true">
                  <RiLeafLine size={14} color="#0a0f0d" />
                </div>
                <div style={{
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px 16px 16px 4px',
                }}>
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 2 && !typing && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: 'rgba(0,255,136,0.06)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 'var(--radius-full)',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,255,136,0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,255,136,0.06)'}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about carbon, tips, navigation…"
              aria-label="Type your message to GreenBot"
              maxLength={300}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '10px 16px',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              aria-label="Send message"
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: input.trim() && !typing
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                  : 'var(--bg-input)',
                border: 'none',
                cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all var(--transition-fast)',
              }}
            >
              <RiSendPlaneLine size={18} color={input.trim() && !typing ? '#0a0f0d' : 'var(--text-muted)'} />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Toggle Button ── */}
      <button
        id="greenbot-toggle"
        onClick={() => { setOpen((o) => !o); setHasUnread(false); }}
        aria-label={open ? 'Close GreenBot assistant' : 'Open GreenBot AI assistant'}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open
            ? 'rgba(255,82,82,0.15)'
            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          border: open ? '1.5px solid rgba(255,82,82,0.4)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          boxShadow: open ? 'none' : '0 8px 25px rgba(0,255,136,0.45)',
          animation: !open ? 'widgetPulse 2.5s ease-in-out infinite' : 'none',
          transition: 'all var(--transition-base)',
        }}
      >
        {open
          ? <RiCloseLine size={24} color="var(--color-error)" />
          : <RiRobot2Line size={24} color="#0a0f0d" />
        }

        {/* Unread badge */}
        {hasUnread && !open && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--color-error)',
            border: '2px solid var(--bg-primary)',
          }} aria-label="Unread message" />
        )}
      </button>

      {/* Tooltip label */}
      {!open && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          right: 88,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          zIndex: 9997,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }} aria-hidden="true">
          <RiQuestionLine size={13} color="var(--color-primary)" />
          Ask GreenBot
        </div>
      )}
    </>
  );
}
