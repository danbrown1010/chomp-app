import { supabase } from '../lib/supabase'

export async function seedChomp(userId) {
  const chomp = {
    user_id: userId,
    nickname: 'Chomp',
    year: 2014,
    make: 'Jeep',
    model: 'Wrangler',
    trim: 'Unlimited Rubicon',
    color: 'Granite Gray',
    current_mileage: 65000,
    is_primary: true,
    suspension: {
      lift_height: '4 inch',
      lift_brand: 'Teraflex',
      shocks: 'Falcon 3.3 Adjustable',
      notes: 'Teraflex HD springs',
    },
    wheels_tires: {
      tire_brand: 'BF Goodrich',
      tire_model: 'All-Terrain T/A KO2',
      tire_size: '35 inch',
      wheel_brand: 'Factory Jeep',
      wheel_size: '17 inch',
      notes: 'Wheel spacers, PowerStop Z36 brakes',
    },
    armor: {
      front_bumper: 'Smittybilt stubby with winch housing',
      rear_bumper: 'Smittybilt XRC Atlas',
      sliders: 'Tube-style rock sliders',
      skid_plates: 'Factory Rubicon skid plates',
      tire_carrier: 'Integrated XRC Atlas',
    },
    recovery: {
      winch_brand: 'Smittybilt',
      winch_rating: '10000 lb',
      recovery_boards: 'MaxTrax',
      hi_lift: 'Hi-Lift jack',
      kinetic_rope: 'Bunker Indust 3x20ft snatch strap 30000 lb',
      notes: '4-ton hydraulic jack, tree strap, 4 D-rings, 2 soft shackles, RENO winch snatch ring 66000 lb',
    },
    camping: {
      sleeping: 'Ursa Minor J30 camper top',
      awning: 'Overland Pro 6K',
      storage: 'ARB Rear Wide Drawer',
      notes: 'ICECO VL45 ProS dual-zone fridge/freezer',
    },
    electrical: {
      primary_battery: 'EcoFlow Delta 2 Max 2048Wh',
      alternator: 'EcoFlow 800W alternator charger',
      compressor: 'ARB Twin Air Compressor',
      switch_panel: 'SPOD Switch Controller',
      notes: '',
    },
    navigation: {
      dash_cam: 'Wolfbox Pro 8.5 Mirror',
      notes: '',
    },
    lighting: {
      notes: '',
    },
    drivetrain: {
      engine: '3.6L Pentastar V6',
      transmission: '4-speed automatic',
      transfer_case: 'Rock-Trac 4:1 low range',
      front_axle: 'Dana 44',
      rear_axle: 'Dana 44',
      lockers: 'Electronic front and rear',
      notes: '',
    },
    other_mods: {
      items: [
        'Vector Shelf',
        'Dash EBar',
        'American Adventure Labs Tire Shelf',
        'Wolfbox Pro 8.5 Mirror Dash Cam',
      ],
      notes: '',
    },
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert(chomp)
    .select()
    .single()

  if (error) {
    console.error('Seed error:', error)
    return null
  }

  console.log('Chomp seeded:', data.id)
  return data
}
