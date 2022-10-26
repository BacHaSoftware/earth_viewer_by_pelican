import "./App.scss"
import "./assets/vendors/styles"
import GlobeViewer from "./components/GlobeViewer";
import MainSlider from "./components/MainSlider";

function App() {
  return (
    <div className="container">
      <GlobeViewer />
      <MainSlider />
    </div>
  );
}

export default App;
