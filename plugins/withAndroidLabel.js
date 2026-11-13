// Sets the name under the icon on Android. The full name "A Method for Prayer"
// is too long for the home screen, so the launcher shows "Prayer". On iOS,
// app.json sets CFBundleDisplayName to the same name.
const { withStringsXml, AndroidConfig } = require('expo/config-plugins')

module.exports = function withAndroidLabel(config, { label }) {
  return withStringsXml(config, (c) => {
    c.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'app_name', translatable: 'false' }, _: label }],
      c.modResults,
    )
    return c
  })
}
