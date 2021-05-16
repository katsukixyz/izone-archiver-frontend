import React, { useState } from "react";
import Image from "next/image";
import "../src/App.css";
import "../src/index.css";
import { Nav, Navbar } from "react-bootstrap";
import ListDataContext from "../contexts/ListDataContext";
import DateRangeContext from "../contexts/DateRangeContext";
import SortContext from "../contexts/SortContext";
import SearchContext from "../contexts/SearchContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

export default function MyApp({ Component, pageProps }) {
  const [listData, setListData] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [sort, setSort] = useState("desc");
  const [search, setSearch] = useState("");

  return (
    <>
      <ListDataContext.Provider value={{ listData, setListData }}>
        <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
          <SortContext.Provider value={{ sort, setSort }}>
            <SearchContext.Provider value={{ search, setSearch }}>
              <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="/">
                  <div style={{ height: "45px" }}>
                    <Image src="/logo.svg" width={46} height={44} />
                  </div>
                </Navbar.Brand>
                <Navbar.Collapse className="justify-content-end">
                  <Nav.Link
                    href="https://patreon.com/katsukixyz"
                    target="_blank"
                    style={{ color: "white" }}
                  >
                    Donate
                  </Nav.Link>
                  <Nav.Link href="/contact" style={{ color: "white" }}>
                    Contact
                  </Nav.Link>
                </Navbar.Collapse>
              </Navbar>
              <Component {...pageProps} />
            </SearchContext.Provider>
          </SortContext.Provider>
        </DateRangeContext.Provider>
      </ListDataContext.Provider>
    </>
  );
}
