import "./App.css";
import "./assets/scss/theme.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound } from "./pages/NotFound";
import { routes } from "./routes";
import { Layout } from "./layout/Layout";

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          {routes.map((route, idx) => (
            <Route
              path={route.path}
              key={idx}
              element={<Layout title={route.title}>{route.component}</Layout>}
            />
          ))}
          <Route
            path="*"
            element={
              <Layout title="Not Found">
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
