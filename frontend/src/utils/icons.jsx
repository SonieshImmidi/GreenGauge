import {
  RiLeafLine, RiSeedlingLine, RiFlashlightLine, RiRecycleLine, RiSunLine,
  RiCarLine, RiLightbulbLine, RiEarthLine, RiRestaurantLine, RiRestaurant2Line,
  RiThermometerLine, RiMoonLine, RiBowlLine, RiBusLine, RiBarChartBoxLine, RiTimerLine,
  RiTreeLine, RiCheckboxCircleLine, RiCheckLine, RiAlertLine, RiTrainLine,
  RiDeleteBinLine, RiErrorWarningLine, RiFireLine, RiNotificationOffLine,
  RiNotification3Line, RiLockLine, RiSearchLine, RiBookOpenLine, RiHomeLine,
  RiMotorbikeLine, RiPlantLine, RiStarLine, RiCloseLine, RiFlightTakeoffLine,
  RiCalculatorLine, RiShoppingCartLine, RiShoppingBagLine, RiToolsLine,
  RiShirtLine, RiWalkLine, RiMap2Line, RiPlugLine, RiAppleLine,
} from 'react-icons/ri';

// Single source of truth mapping the emojis the app used to render to react-icons
// SVG components. Keys include the bare codepoint and the U+FE0F variation-selector
// form so lookups succeed regardless of how the emoji was authored (or sent by the API).
const EMOJI_ICON_MAP = {
  '🌿': RiLeafLine,
  '🌱': RiSeedlingLine,
  '⚡': RiFlashlightLine,
  '♻️': RiRecycleLine, '♻': RiRecycleLine,
  '☀️': RiSunLine, '☀': RiSunLine,
  '🚗': RiCarLine, '🚙': RiCarLine,
  '💡': RiLightbulbLine,
  '🌍': RiEarthLine, '🌎': RiEarthLine, '🌏': RiEarthLine,
  '🍽️': RiRestaurantLine, '🍽': RiRestaurantLine,
  '🌡️': RiThermometerLine, '🌡': RiThermometerLine,
  '⏱️': RiTimerLine, '⏱': RiTimerLine,
  '🌙': RiMoonLine,
  '🥗': RiBowlLine,
  '🥩': RiRestaurant2Line,
  '🚌': RiBusLine,
  '🚆': RiTrainLine,
  '🏍️': RiMotorbikeLine, '🏍': RiMotorbikeLine,
  '🚶': RiWalkLine,
  '✈️': RiFlightTakeoffLine, '✈': RiFlightTakeoffLine,
  '📊': RiBarChartBoxLine,
  '🌳': RiTreeLine,
  '🌾': RiPlantLine,
  '🌟': RiStarLine,
  '✅': RiCheckboxCircleLine,
  '✓': RiCheckLine,
  '✕': RiCloseLine,
  '⚠️': RiAlertLine, '⚠': RiAlertLine,
  '🔴': RiErrorWarningLine,
  '🗑️': RiDeleteBinLine, '🗑': RiDeleteBinLine,
  '🔥': RiFireLine,
  '🔕': RiNotificationOffLine,
  '🔔': RiNotification3Line,
  '🔒': RiLockLine,
  '🔍': RiSearchLine,
  '📚': RiBookOpenLine,
  '🏠': RiHomeLine, '🏡': RiHomeLine,
  '🛒': RiShoppingCartLine,
  '🍎': RiAppleLine,
  '🛍️': RiShoppingBagLine, '🛍': RiShoppingBagLine,
  '🔧': RiToolsLine,
  '👕': RiShirtLine,
  '🗺️': RiMap2Line, '🗺': RiMap2Line,
  '🔌': RiPlugLine,
  '🧮': RiCalculatorLine,
};

/**
 * Renders the react-icons SVG mapped from an emoji string (e.g. a value coming
 * from the API's `icon` field, or a former hard-coded glyph). Falls back to a
 * leaf icon when the emoji is unknown. All extra props (size, color, style,
 * className, aria-*) are forwarded to the icon.
 */
export function EmojiIcon({ emoji, fallback: Fallback = RiLeafLine, ...props }) {
  const key = (emoji || '').trim();
  const Icon = EMOJI_ICON_MAP[key] || EMOJI_ICON_MAP[key.replace(/️/g, '')] || Fallback;
  return <Icon {...props} />;
}

export default EmojiIcon;
