import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  )
}

export default Layout
