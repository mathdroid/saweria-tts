import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { useSSE, SSEProvider } from "react-hooks-sse";

const SpeechSynthesis = dynamic(
  () => import("react-speech-kit").then(mod => mod.SpeechSynthesis),
  {
    ssr: false
  }
);

const baseURL = `https://api.saweria.co/stream?channel=donation.`;

const Speaker = ({ speak, minimum, voices }) => {
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const event = useSSE("donations");

  const onChange = e => {
    setSelectedVoiceName(e.target.value);
  };

  useEffect(() => {
    if (voices.length > 0) {
      setSelectedVoiceName(voices[0].name);
    }
  }, [voices]);

  useEffect(() => {
    if (event) {
      try {
        const amount = parseInt(event.data.data.amount, 10);
        if (amount >= minimum) {
          const text = `${event.data.data.donatee} said: ${event.data.data.message}`;
          const voice = voices.find(v => v.name === selectedVoiceName);
          speak({ text, voice });
        }
      } catch (error) {
        console.error(`Can't speak.`);
      }
    }
  }, [event, voices, selectedVoiceName]);

  return (
    <>
      <select onChange={onChange} value={selectedVoiceName}>
        {voices.map(voice => {
          return <option key={voice.name}>{voice.name}</option>;
        })}
      </select>
      <h1>minimum: {minimum}</h1>
    </>
  );
};

const Home = ({ id }) => {
  const [minimum, setMinimum] = useState(10000);
  const onChange = e => {
    try {
      setMinimum(parseInt(e.target.value, 10));
    } catch (error) {
      setMinimum(0);
    }
  };
  return (
    <SSEProvider endpoint={`${baseURL}${id}`}>
      <input value={minimum} onChange={onChange} />
      <button>Press to activate TTS</button>
      <p>
        See https://www.chromestatus.com/feature/5687444770914304 for more
        details
      </p>
      <SpeechSynthesis>
        {({ speak, voices }) => (
          <Speaker speak={speak} minimum={minimum} voices={voices} />
        )}
      </SpeechSynthesis>
    </SSEProvider>
  );
};

Home.getInitialProps = ({ query }) => {
  return {
    id: query["id"]
  };
};

export default Home;
