import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server!
    // Requests should be made to http://SERVICENAME.NAMESPACE.svc.cluster.local/PATH
    return axios.create({
      baseURL: "http://www.udemy.esporttips.de/",
      headers: req.headers,
    });
  } else {
    // We are on the browser!
    // Requests should be made with a base url of ''
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
