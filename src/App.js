import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PatientListPage } from "./pages/PatientListPage"


function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path={""} element={<PatientListPage></PatientListPage>}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
