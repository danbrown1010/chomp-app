import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/index'
import { getAnthropicKey } from '../utils/apiKeys'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)))
}

const COOKING_SETUPS = [
  { id: 'no-cook',      label: 'No-cook' },
  { id: 'pocket-stove', label: 'Pocket Stove' },
  { id: 'jetboil',      label: 'Jetboil' },
  { id: 'genesis',      label: 'Genesis' },
  { id: 'induction',    label: 'Induction' },
  { id: 'takibi',       label: 'Snow Peak Takibi' },
  { id: 'fireside',     label: 'Fireside' },
]
const SETUP_LABEL = Object.fromEntries(COOKING_SETUPS.map(s => [s.id, s.label]))

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free',
  'Dairy-free', 'Nut-free', 'Low-carb', 'Halal',
]

const FUEL_OPTIONS = [
  { id: 'wood',      label: 'Wood' },
  { id: 'charcoal',  label: 'Charcoal' },
  { id: 'propane',   label: 'Propane' },
  { id: 'butane',    label: 'Butane' },
  { id: 'isobutane', label: 'Isobutane' },
  { id: 'electric',  label: 'Electric' },
]

const PROPANE_SIZES = [
  { id: '1lb',  label: '1 lb' },
  { id: '5lb',  label: '5 lb' },
  { id: '20lb', label: '20 lb' },
]

const ELECTRIC_LEVELS = [
  { id: 'minimal',  label: 'Minimal' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'full',     label: 'Full (EcoFlow)' },
]

const SHOPPING_GROUPS = ['produce', 'proteins', 'dairy', 'dry', 'condiments', 'equipment']
const SHOPPING_LABELS = {
  produce: 'Produce', proteins: 'Proteins', dairy: 'Dairy',
  dry: 'Dry goods', condiments: 'Condiments', equipment: 'Equipment',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stepper({ value, min, max, onChange }) {
  const btn = (action, disabled) => ({
    width: 32, height: 32, borderRadius: '50%',
    border: '1px solid var(--border)',
    background: disabled ? 'transparent' : 'var(--bg-card)',
    color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
    fontSize: 18, lineHeight: 1, cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button style={btn('-', value <= min)} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', minWidth: 32, textAlign: 'center' }}>
        {value}
      </span>
      <button style={btn('+', value >= max)} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  )
}

function PillGroup({ options, value, onChange, multi = false }) {
  const { accent } = useAppStore()
  const isActive = (id) => multi ? value.includes(id) : value === id
  const handle = (id) => {
    if (multi) {
      onChange(isActive(id) ? value.filter(v => v !== id) : [...value, id])
    } else {
      onChange(id)
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const id = typeof opt === 'string' ? opt : opt.id
        const label = typeof opt === 'string' ? opt : opt.label
        const active = isActive(id)
        return (
          <button key={id} onClick={() => handle(id)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            border: `1px solid ${active ? accent : 'var(--border)'}`,
            background: active ? `${accent}22` : 'var(--bg-card)',
            color: active ? accent : 'var(--text-secondary)',
            fontWeight: active ? 600 : 400,
            transition: 'all 0.15s',
          }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ on, onChange }) {
  const { accent } = useAppStore()
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? accent : 'var(--border)',
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, width: 20, height: 20,
        borderRadius: '50%', background: '#fff',
        transition: 'transform 0.2s',
        transform: on ? 'translateX(22px)' : 'translateX(2px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

function FieldCard({ label, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function SectionHeader({ title, expanded, onToggle, right }) {
  return (
    <button onClick={onToggle} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {right}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </button>
  )
}

function CheckRow({ label, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', cursor: 'pointer',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
        background: checked ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span style={{
        fontSize: 13, fontFamily: 'var(--font-body)', lineHeight: 1.5,
        color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)',
        textDecoration: checked ? 'line-through' : 'none',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── Setup view ───────────────────────────────────────────────────────────────

function SetupView({ config, setConfig, onGenerate, generating, error, onBack, hasSavedPlan, onViewSaved }) {
  const { accent } = useAppStore()
  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }))
  const hasKey = Boolean(getAnthropicKey())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
          <button onClick={onBack} style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em', margin: 0 }}>MEAL PLANNER</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', margin: '2px 0 0' }}>AI OFF-GRID MEALS · VELA</p>
          </div>
          {hasSavedPlan && (
            <button onClick={onViewSaved} style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 20,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', cursor: 'pointer',
            }}>
              View saved
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
        {!hasKey && (
          <div style={{ padding: '12px 16px', background: 'rgba(196,82,26,0.1)', border: '1px solid rgba(196,82,26,0.3)', borderRadius: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent, #C4521A)', marginBottom: 2 }}>API key required</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Go to More → Survival Agent to configure your Anthropic API key.</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* Duration + people */}
        <FieldCard label="Trip">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>Duration</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Stepper value={config.days} min={1} max={14} onChange={v => update('days', v)} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 36 }}>{config.days === 1 ? 'day' : 'days'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>People</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Stepper value={config.people} min={1} max={8} onChange={v => update('people', v)} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 36 }}>{config.people === 1 ? 'person' : 'people'}</span>
              </div>
            </div>
          </div>
        </FieldCard>

        {/* Cooking setup */}
        <FieldCard label="Cooking setup">
          <PillGroup options={COOKING_SETUPS} value={config.cookingSetup} onChange={v => update('cookingSetup', v)} />
        </FieldCard>

        {/* Dietary */}
        <FieldCard label="Dietary needs">
          <PillGroup options={DIETARY_OPTIONS} value={config.dietary} onChange={v => update('dietary', v)} multi />
          {config.dietary.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, fontFamily: 'var(--font-body)' }}>None selected — no restrictions</p>
          )}
        </FieldCard>

        {/* Fuel budget */}
        {config.cookingSetup !== 'no-cook' && (
          <FieldCard label="Fuel source">
            <PillGroup options={FUEL_OPTIONS} value={config.fuelType} onChange={v => update('fuelType', v)} />
            {config.fuelType === 'propane' && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Canister size</p>
                <PillGroup options={PROPANE_SIZES} value={config.propaneSize} onChange={v => update('propaneSize', v)} />
              </div>
            )}
            {config.fuelType === 'electric' && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Power level</p>
                <PillGroup options={ELECTRIC_LEVELS} value={config.electricLevel} onChange={v => update('electricLevel', v)} />
              </div>
            )}
          </FieldCard>
        )}

        {/* Resupply */}
        <FieldCard label="Resupply">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', margin: 0 }}>Mid-trip resupply stop</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                {config.resupply ? 'Fresh ingredients first half' : 'Shelf-stable only throughout'}
              </p>
            </div>
            <Toggle on={config.resupply} onChange={v => update('resupply', v)} />
          </div>
        </FieldCard>

        {/* Notes */}
        <FieldCard label="Notes & preferences">
          <textarea
            value={config.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Preferences, allergies, favourite meals, dietary goals…"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 12px',
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              fontSize: 14, lineHeight: 1.5, outline: 'none', resize: 'none',
            }}
          />
        </FieldCard>
      </div>

      {/* Generate button — pinned */}
      <div style={{ padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={onGenerate}
          disabled={!hasKey || generating}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 12, border: 'none',
            background: hasKey && !generating ? accent : 'var(--bg-card)',
            color: hasKey && !generating ? '#fff' : 'var(--text-tertiary)',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
            cursor: hasKey && !generating ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
        >
          {generating ? 'Generating…' : 'Generate meal plan →'}
        </button>
      </div>
    </div>
  )
}

// ─── Generating view ──────────────────────────────────────────────────────────

function GeneratingView({ config }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, padding: 32 }}>
      <div style={{ fontSize: 52, animation: 'pulse 2s ease-in-out infinite' }}>🏕</div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', margin: 0 }}>
        Planning your meals…
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
        {SETUP_LABEL[config.cookingSetup]} · {config.days} {config.days === 1 ? 'day' : 'days'} · {config.people} {config.people === 1 ? 'person' : 'people'}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Plan view ────────────────────────────────────────────────────────────────

function MealCard({ meal, expanded, onToggle, checked, onCheck }) {
  const diffColor = meal.difficulty === 'easy' ? '#22c55e' : meal.difficulty === 'medium' ? '#f97316' : '#ef4444'

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      {/* Meal header */}
      <button onClick={onToggle} style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
          {meal.type}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', fontFamily: 'var(--font-body)' }}>{meal.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>{meal.description}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 2, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {meal.prepTime && <Chip>⏱ {meal.prepTime} prep</Chip>}
          {meal.cookTime && <Chip>🍳 {meal.cookTime} cook</Chip>}
          {meal.calories && <Chip>🔥 {meal.calories} cal</Chip>}
          {meal.protein && <Chip>💪 {meal.protein}g protein</Chip>}
          {meal.difficulty && <Chip style={{ color: diffColor }}>{meal.difficulty}</Chip>}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Ingredients */}
          {meal.ingredients?.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Ingredients</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {meal.ingredients.map((ing, i) => {
                  const label = typeof ing === 'string'
                    ? ing
                    : `${ing.item}${ing.amount ? ' — ' + ing.amount : ''}${ing.perPerson ? ' per person' : ''}`
                  return (
                    <CheckRow
                      key={i}
                      label={label}
                      checked={checked.has(`ing-${meal.type}-${meal.name}-${i}`)}
                      onToggle={() => onCheck(`ing-${meal.type}-${meal.name}-${i}`)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Instructions */}
          {meal.instructions && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Instructions</p>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-body)' }}>{meal.instructions}</p>
            </div>
          )}

          {/* Prep ahead */}
          {meal.prepAhead && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 10px', background: 'rgba(196,82,26,0.08)', border: '1px solid rgba(196,82,26,0.2)', borderRadius: 8 }}>
              <span style={{ flexShrink: 0 }}>📦</span>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                <strong style={{ color: 'var(--accent, #C4521A)' }}>Prep at home: </strong>{meal.prepAhead}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ children, style }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 10,
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  )
}

function PlanView({ plan, config, onRegenerate, onNewPlan, onBack, checked, onCheck }) {
  const [expandedDays, setExpandedDays] = useState(new Set([0]))
  const [expandedMeals, setExpandedMeals] = useState(new Set())
  const [showShopping, setShowShopping]   = useState(false)
  const [showPrep, setShowPrep]           = useState(false)
  const [showNotes, setShowNotes]         = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [])

  const toggleDay = (i) => setExpandedDays(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  const toggleMeal = (key) => setExpandedMeals(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px 10px' }}>
          <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {plan.title}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>MEAL PLANNER · VELA AI</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={onRegenerate} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 16, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              Regenerate
            </button>
            <button onClick={onNewPlan} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 16, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
              New plan
            </button>
          </div>
        </div>

        {/* Summary + chips */}
        <div style={{ padding: '0 16px 12px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px', fontFamily: 'var(--font-body)' }}>{plan.summary}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip>{config.days} {config.days === 1 ? 'day' : 'days'}</Chip>
            <Chip>{config.people} {config.people === 1 ? 'person' : 'people'}</Chip>
            <Chip>{SETUP_LABEL[config.cookingSetup]}</Chip>
            {config.dietary.length > 0 && <Chip>{config.dietary.join(', ')}</Chip>}
            {(plan.cost || plan.totalEstimatedCost) && <Chip>{plan.cost || plan.totalEstimatedCost}</Chip>}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>

        {/* Daily meals */}
        {plan.days?.map((day, di) => {
          const isExpanded = expandedDays.has(di)
          return (
            <div key={di} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <button onClick={() => toggleDay(di)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{day.label || `Day ${day.day}`}</p>
                  {day.notes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', fontFamily: 'var(--font-body)' }}>{day.notes}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {day.totalCalories && <Chip>🔥 {day.totalCalories} cal</Chip>}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {day.meals?.map((meal, mi) => {
                    const mkey = `${di}-${mi}`
                    return (
                      <MealCard
                        key={mkey}
                        meal={meal}
                        expanded={expandedMeals.has(mkey)}
                        onToggle={() => toggleMeal(mkey)}
                        checked={checked}
                        onCheck={onCheck}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Shopping list */}
        {plan.shoppingList && (() => {
          const totalItems = SHOPPING_GROUPS.reduce((acc, g) => acc + (plan.shoppingList[g]?.length ?? 0), 0)
          return (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
            <SectionHeader title={`Shopping list · ${totalItems} items`} expanded={showShopping} onToggle={() => setShowShopping(v => !v)} />
            {showShopping && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {SHOPPING_GROUPS.filter(g => plan.shoppingList[g]?.length).map(group => (
                  <div key={group}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                      {SHOPPING_LABELS[group]}
                    </p>
                    {plan.shoppingList[group].map((item, i) => (
                      <CheckRow
                        key={i}
                        label={item}
                        checked={checked.has(`shop-${group}-${i}`)}
                        onToggle={() => onCheck(`shop-${group}-${i}`)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          )
        })()}

        {/* Prep ahead */}
        {plan.prepAheadTasks?.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
            <SectionHeader title="Prep at home" expanded={showPrep} onToggle={() => setShowPrep(v => !v)} />
            {showPrep && (
              <div style={{ marginTop: 12 }}>
                {plan.prepAheadTasks.map((task, i) => (
                  <CheckRow
                    key={i}
                    label={task}
                    checked={checked.has(`prep-${i}`)}
                    onToggle={() => onCheck(`prep-${i}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {(plan.fuelNotes || plan.storageNotes) && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
            <SectionHeader title="Field notes" expanded={showNotes} onToggle={() => setShowNotes(v => !v)} />
            {showNotes && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.fuelNotes && (
                  <div style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                    <span>⚡</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>{plan.fuelNotes}</p>
                  </div>
                )}
                {plan.storageNotes && (
                  <div style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                    <span>🧊</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>{plan.storageNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function MealPlanningPage({ onBack }) {
  const { activeTrip } = useAppStore()

  const [view, setView] = useState('setup')
  const [config, setConfig] = useState(() => ({
    days: activeTrip
      ? daysBetween(activeTrip.departureDate, activeTrip.returnDate)
      : 3,
    people: 2,
    cookingSetup: 'pocket-stove',
    dietary: [],
    fuelType: 'propane',
    propaneSize: '1lb',
    electricLevel: 'moderate',
    resupply: false,
    notes: '',
  }))
  const [mealPlan, setMealPlan] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem('vela-meal-checked')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })

  // Restore saved plan on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vela-meal-plan')
      if (saved) {
        const { plan, config: savedConfig } = JSON.parse(saved)
        setMealPlan(plan)
        setConfig(savedConfig)
        setView('plan')
      }
    } catch { /* ignore corrupt cache */ }
  }, [])

  const toggleCheck = (key) => {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      localStorage.setItem('vela-meal-checked', JSON.stringify([...next]))
      return next
    })
  }

  const generateMealPlan = async () => {
    const apiKey = getAnthropicKey()
    if (!apiKey) return

    setGenerating(true)
    setView('generating')
    setError('')

    const system = `You are VELA's expedition meal planner. You create practical, delicious off-grid meal plans for overlanders and backcountry campers.

Your meal plans are:
- Realistic for the cooking setup specified
- Optimised for nutrition and energy on trail
- Mindful of food storage (cooler vs dry storage)
- Aware of Leave No Trace (minimal waste)
- Specific with quantities and ingredients

Always respond with valid JSON only. No preamble, no markdown fences, just the JSON.`

    const user = `Create a ${config.days}-day meal plan for ${config.people} people.

Cooking setup: ${SETUP_LABEL[config.cookingSetup]}
Dietary requirements: ${config.dietary.length > 0 ? config.dietary.join(', ') : 'none'}
Fuel type: ${config.fuelType}${config.fuelType === 'propane' ? ` — ${config.propaneSize} canister` : ''}${config.fuelType === 'electric' ? ` — power level: ${config.electricLevel}` : ''}
Resupply available mid-trip: ${config.resupply}
Notes: ${config.notes || 'none'}

STRICT RULES — output will be cut off if you exceed the token limit:
- Max 4 ingredients per meal (strings only, no objects)
- Instructions: 1 sentence only
- No cookMethod, no prepAhead, no difficulty, no totalCalories per day
- fuelNotes and storageNotes: 1 sentence each
- No extra fields beyond the schema below

Return this exact JSON:
{
  "title": "Plan title",
  "summary": "One sentence",
  "days": [
    {
      "day": 1,
      "label": "Day 1",
      "meals": [
        {
          "type": "Breakfast",
          "name": "Meal name",
          "calories": 450,
          "protein": 22,
          "prepTime": "15 min",
          "ingredients": ["1 cup oats", "2 tbsp honey", "1/4 cup dried fruit"],
          "instructions": "One sentence.",
          "storage": "dry"
        }
      ]
    }
  ],
  "shoppingList": {
    "produce": ["item"],
    "proteins": ["item"],
    "dairy": ["item"],
    "dry": ["item"],
    "condiments": ["item"],
    "equipment": ["item"]
  },
  "prepAheadTasks": ["task"],
  "fuelNotes": "One sentence.",
  "storageNotes": "One sentence.",
  "cost": "$120-150 for 2 people"
}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 8192,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error.message)

      if (data.stop_reason === 'max_tokens') {
        setError('Response was cut off — try fewer days or tap Regenerate.')
        setView('setup')
        setGenerating(false)
        return
      }

      const text = data.content?.[0]?.text ?? ''
      console.log('Raw response length:', text.length, '| stop_reason:', data.stop_reason)

      const clean = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      try {
        const plan = JSON.parse(clean)
        setMealPlan(plan)
        setView('plan')
        localStorage.setItem('vela-meal-plan', JSON.stringify({
          plan, config, generatedAt: new Date().toISOString(),
        }))
      } catch (parseErr) {
        setError('Response was cut off — try fewer days or tap Regenerate.')
        setView('setup')
        console.error('Parse error:', parseErr)
        console.error('Raw text:', text)
      }
    } catch (err) {
      setError(`Failed to generate: ${err.message}`)
      setView('setup')
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerate = () => {
    setView('setup')
  }

  const handleNewPlan = () => {
    localStorage.removeItem('vela-meal-plan')
    localStorage.removeItem('vela-meal-checked')
    setMealPlan(null)
    setChecked(new Set())
    setConfig({
      days: activeTrip ? daysBetween(activeTrip.departureDate, activeTrip.returnDate) : 3,
      people: 2, cookingSetup: 'camp-stove', dietary: [],
      powerBudget: 'moderate', difficulty: 'easy', resupply: false, notes: '',
    })
    setView('setup')
  }

  if (view === 'generating') return (
    <div style={{ height: '100%', background: 'var(--bg-primary)' }}>
      <GeneratingView config={config} />
    </div>
  )

  if (view === 'plan' && mealPlan) return (
    <div style={{ height: '100%', background: 'var(--bg-primary)' }}>
      <PlanView
        plan={mealPlan}
        config={config}
        onRegenerate={handleRegenerate}
        onNewPlan={handleNewPlan}
        onBack={onBack}
        checked={checked}
        onCheck={toggleCheck}
      />
    </div>
  )

  return (
    <div style={{ height: '100%', background: 'var(--bg-primary)' }}>
      <SetupView
        config={config}
        setConfig={setConfig}
        onGenerate={generateMealPlan}
        generating={generating}
        error={error}
        onBack={onBack}
        hasSavedPlan={Boolean(mealPlan)}
        onViewSaved={() => setView('plan')}
      />
    </div>
  )
}
