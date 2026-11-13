import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button } from '../components/Button.tsx'
import { P, Page } from '../components/Prose.tsx'
import { useStore } from '../lib/prefs.tsx'
import { serif, useColors } from '../lib/theme.ts'

export default function IntercessionList() {
  const c = useColors()
  const { list, add, remove } = useStore()
  const [text, setText] = useState('')
  const submit = () => {
    add(text)
    setText('')
  }
  return (
    <Page>
      <P muted>
        Add the names and the needs that you pray for. The guided prayer shows them in the part for intercession. The list
        stays on this device only. The app sends it nowhere.
      </P>
      <View style={st.add}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
          placeholder="A name or a need"
          placeholderTextColor={c.muted}
          returnKeyType="done"
          maxLength={200}
          accessibilityLabel="A name or a need"
          style={[st.input, { color: c.ink, borderColor: c.line, backgroundColor: c.card }]}
        />
        <Button primary label="Add" onPress={submit} />
      </View>
      {list.length === 0 && <P muted>The list is empty.</P>}
      {list.map((x) => (
        <View key={x.id} style={[st.row, { borderBottomColor: c.line }]}>
          <Text style={[st.text, { color: c.ink }]}>{x.text}</Text>
          <Pressable onPress={() => remove(x.id)} accessibilityRole="button" accessibilityLabel={`Remove ${x.text}`} hitSlop={10}>
            <Text style={[st.remove, { color: c.accent }]}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </Page>
  )
}

const st = StyleSheet.create({
  add: { flexDirection: 'row', gap: 10, alignItems: 'center', marginVertical: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 17 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  text: { flex: 1, fontFamily: serif.regular, fontSize: 17, lineHeight: 24 },
  remove: { fontSize: 15, fontWeight: '600' },
})
