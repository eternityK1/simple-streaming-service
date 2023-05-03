import css from  './App.module.css';
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";

function App() {
  return (
    <div className={css.main_container}>
      <VideoPlayer hlsStreamUrlProp={'https://cdn-vos-ppp-01.vos360.video/Content/HLS_HLSCLEAR/Live/channel(PPP-LL-2HLS)/index.m3u8'}></VideoPlayer>
    </div>
  );
}

export default App;