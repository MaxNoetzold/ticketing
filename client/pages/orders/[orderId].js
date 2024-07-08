import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const OrderShow = (props) => {
  const { order, currentUser } = props;

  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const secondsLeft = (new Date(order.expiresAt) - new Date()) / 1000;

      setTimeLeft(Math.round(secondsLeft));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  return (
    <div>
      <h1>Order Details</h1>
      <h4>{order.ticket.title}</h4>
      <h4>{order.ticket.price}</h4>
      <h4>{order.status}</h4>
      {timeLeft > 0 ? (
        <h4>Time left to pay: {timeLeft} seconds</h4>
      ) : (
        <h4>Order Expired</h4>
      )}
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51PZeyoCWTvrQpnynSLItDRCf0A1XN5Y4KtiuCozTJgdFEIhiCsCp5UuyfqmJxB3bKbAr2husGiEKDDFJkR4qjiAS00jVPIMvIW"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
