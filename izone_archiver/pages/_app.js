import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../src/App.css";
import "../src/index.css";
import { Nav, Navbar } from "react-bootstrap";
import ListDataContext from "../contexts/ListDataContext";
import DateRangeContext from "../contexts/DateRangeContext";
import SortContext from "../contexts/SortContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";

export default function MyApp({ Component, pageProps }) {
  // const [data, setData] = useState([]);
  const [listData, setListData] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [sort, setSort] = useState("desc");

  return (
    <>
      <ListDataContext.Provider value={{ listData, setListData }}>
        <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
          <SortContext.Provider value={{ sort, setSort }}>
            <Navbar bg="dark" variant="dark" expand="lg">
              <Link href="/">
                <Navbar.Brand href="/">
                  <div style={{ height: "45px" }}>
                    <Image src="/logo.svg" width={46} height={44} />
                  </div>
                </Navbar.Brand>
              </Link>
              <Navbar.Collapse className="justify-content-end">
                <Link href="/donate">
                  <Nav.Link href="/donate" style={{ color: "white" }}>
                    Donate
                  </Nav.Link>
                </Link>
                <Link href="/contact">
                  <Nav.Link href="/contact" style={{ color: "white" }}>
                    Contact
                  </Nav.Link>
                </Link>
              </Navbar.Collapse>
            </Navbar>
            <Component {...pageProps} />
          </SortContext.Provider>
        </DateRangeContext.Provider>
      </ListDataContext.Provider>
    </>
  );
}
