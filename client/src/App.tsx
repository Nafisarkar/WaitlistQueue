import { hc, type InferResponseType } from 'hono/client'
import type { AppType } from "../../server/index.ts";
import { useEffect, useState } from 'react';


const client = hc<AppType>('http://localhost:3000/')

function App() {
  const [ msg, setMsg ] = useState<InferResponseType<typeof client.index.$get>>();

 useEffect(() => {
    const getMsg = async () => {
      const res = await client.index.$get();
      if (res.ok) {
        setMsg(await res.json());
      } else {
        setMsg({
          "health":"offline"
        })
      }
    }
    getMsg()
  }, [])

  return (
    <>
      <section id="center">
          Server : {msg?.health}
      </section>
    </>
  )
}

export default App
