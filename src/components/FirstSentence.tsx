// Below 700px only the first sentence of the copy shows. The rest is hidden,
// never reworded, and shows again from 701px.
export default function FirstSentence({ text }: { text: string }) {
  const [first, ...rest] = text.split(/(?<=[.!?])\s+/)
  return (
    <>
      {first}
      {rest.length > 0 && <span className="max-tablet:hidden"> {rest.join(' ')}</span>}
    </>
  )
}
