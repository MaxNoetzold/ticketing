/*
  Wrapper for all pages to add global styles
*/

import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </>
  );
};

AppComponent.getInitialProps = async ({ ctx, Component }) => {
  const axiosClient = buildClient(ctx);

  let currentUser = null;
  try {
    const { data } = await axiosClient.get("/api/users/currentuser");
    currentUser = data.currentUser;
  } catch (error) {
    console.error("Error fetching data from server", error);
  }

  let pageProps = {};
  try {
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(
        ctx,
        axiosClient,
        currentUser
      );
    }
  } catch (error) {}

  return {
    pageProps,
    currentUser,
  };
};

export default AppComponent;
