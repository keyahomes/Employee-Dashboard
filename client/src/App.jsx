import { Routes, Route } from "react-router-dom";

import Main from "./pages/Main";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import SalesHome from "./pages/SalesHome";
import OfficeHome from "./pages/OfficeHome";
import EngineersHome from "./pages/EngineersHome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<SignUp/>} />
      <Route path="/officehome" element={<OfficeHome />} />
      <Route path="/saleshome" element={<SalesHome/>} />
      <Route path="/engineershome" element={<EngineersHome />} /> 

      {/* other routes */}

    </Routes>
  );
}

export default App;
