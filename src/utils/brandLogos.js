export const VENDOR_LOGOS = {
  'nikon':          'https://www.nikon.com/favicon.ico',
  'dji':            'https://www.dji.com/favicon.ico',
  'sony':           'https://www.sony.com/favicon.ico',
  'apple':          'https://www.apple.com/favicon.ico',
  'garmin':         'https://www.garmin.com/favicon.ico',
  'ecoflow':        'https://www.ecoflow.com/favicon.ico',
  'jackery':        'https://www.jackery.com/favicon.ico',
  'yeti':           'https://www.yeti.com/favicon.ico',
  'jetboil':        'https://www.jetboil.com/favicon.ico',
  'nemo':           'https://www.nemoequipment.com/favicon.ico',
  'marmot':         'https://www.marmot.com/favicon.ico',
  'rei':            'https://www.rei.com/favicon.ico',
  'thule':          'https://www.thule.com/favicon.ico',
  'yakima':         'https://www.yakima.com/favicon.ico',
  'black diamond':  'https://www.blackdiamondequipment.com/favicon.ico',
  'big agnes':      'https://www.bigagnes.com/favicon.ico',
  'osprey':         'https://www.ospreypacks.com/favicon.ico',
  'salomon':        'https://www.salomon.com/favicon.ico',
  'merrell':        'https://www.merrell.com/favicon.ico',
  'hydro flask':    'https://www.hydroflask.com/favicon.ico',
  'sawyer':         'https://www.sawyer.com/favicon.ico',
  'grayl':          'https://grayl.com/favicon.ico',
  'katadyn':        'https://www.katadyn.com/favicon.ico',
  'lifesaver':      'https://www.lifesaversystems.com/favicon.ico',
  'eno':            'https://www.eaglesnestoutfittersinc.com/favicon.ico',
  'helinox':        'https://www.helinox.com/favicon.ico',
  'gerber':         'https://www.gerbergear.com/favicon.ico',
  'dewalt':         'https://www.dewalt.com/favicon.ico',
  'motorola':       'https://www.motorola.com/favicon.ico',
  'jbl':            'https://www.jbl.com/favicon.ico',
  'starlink':       'https://www.starlink.com/favicon.ico',
  'verizon':        'https://www.verizon.com/favicon.ico',
  'insta360':       'https://www.insta360.com/favicon.ico',
  'gopro':          'https://www.gopro.com/favicon.ico',
  'sandisk':        'https://www.westerndigital.com/favicon.ico',
  'smittybilt':     'https://www.smittybilt.com/favicon.ico',
  'nrs':            'https://www.nrs.com/favicon.ico',
  'thermacell':     'https://www.thermacell.com/favicon.ico',
  'mpowerd':        'https://www.mpowerd.com/favicon.ico',
  'udap':           'https://udap.com/favicon.ico',
  'amerex':         'https://www.amerex-fire.com/favicon.ico',
  'sea to summit':  'https://www.seatosummit.com/favicon.ico',
  'front runner':   'https://www.frontrunneroutfitters.com/favicon.ico',
  'ursa minor':     'https://www.ursaminorvehicles.com/favicon.ico',
  'barebones':      'https://www.barebonesliving.com/favicon.ico',
  'ego':            'https://egopowerplus.com/favicon.ico',
  'nite ize':       'https://www.niteize.com/favicon.ico',
  'petzl':          'https://www.petzl.com/favicon.ico',
  'snow peak':      'https://www.snowpeak.com/favicon.ico',
  'soto':           'https://sotooutdoors.com/favicon.ico',
  'msr':            'https://www.msrgear.com/favicon.ico',
  'therm-a-rest':   'https://www.thermarest.com/favicon.ico',
  'pendleton':      'https://www.pendleton-usa.com/favicon.ico',
  'volkl':          'https://www.volkl.com/favicon.ico',
}

export const STORE_LOGOS = {
  'amazon':        'https://www.amazon.com/favicon.ico',
  'rei':           'https://www.rei.com/favicon.ico',
  'home depot':    'https://www.homedepot.com/favicon.ico',
  'costco':        'https://www.costco.com/favicon.ico',
  'moosejaw':      'https://www.moosejaw.com/favicon.ico',
  'backcountry':   'https://www.backcountry.com/favicon.ico',
  'walmart':       'https://www.walmart.com/favicon.ico',
  'target':        'https://www.target.com/favicon.ico',
}

export function getVendorLogo(vendor) {
  if (!vendor) return null
  return VENDOR_LOGOS[vendor.toLowerCase()] ?? null
}

export function getStoreLogo(store) {
  if (!store) return null
  return STORE_LOGOS[store.toLowerCase()] ?? null
}
