const amqp = require("amqplib");
const config = require("../config");
const OrderService = require("../services/orderService");

class MessageBroker {
  static async connect() {
    try {
      const connection = await amqp.connect(config.rabbitMQUrl); // ① kết nối tới RabbitMQ
      const channel = await connection.createChannel(); // ② tạo channel làm việc

      // Declare the order queue
      await channel.assertQueue(config.rabbitMQQueue, { durable: true }); // ③ đảm bảo queue tồn tại

      // Consume messages from the order queue on buy
      channel.consume(config.rabbitMQQueue, async (message) => { // ④ lắng nghe queue “orders”
        try {
          const order = JSON.parse(message.content.toString()); // ⑤ parse message
          const orderService = new OrderService();
          await orderService.createOrder(order); // ⑥ xử lý nghiệp vụ: lưu DB
          channel.ack(message);  // ⑦ xác nhận xử lý xong
        } catch (error) {
          console.error(error); // ⑧ báo lỗi (không requeue)
          channel.reject(message, false);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MessageBroker;
