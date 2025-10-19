const amqp = require("amqplib");

class MessageBroker {
  constructor() {
    this.channel = null;  // Biến lưu trữ channel RabbitMQ
  }

  async connect() {
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const connection = await amqp.connect("amqp://rabbitmq:5672");
        this.channel = await connection.createChannel();
        // Đảm bảo queue 'products' tồn tại (để nhận kết quả từ Order service)
        await this.channel.assertQueue("products");
        console.log("RabbitMQ connected");
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 20000); // delay 10 seconds to wait for RabbitMQ to start
  }

  // Hàm gửi tin nhắn đến một queue cụ thể
  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      // Gửi message (đã chuyển thành buffer JSON) đến queue chỉ định
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
    } catch (err) {
      console.log(err);
    }
  }

  // Hàm lắng nghe tin nhắn từ một queue cụ thể
  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      // Bắt đầu consume từ queue chỉ định
      await this.channel.consume(queue, (message) => {
        const content = message.content.toString();   // Lấy nội dung message
        const parsedContent = JSON.parse(content);
        callback(parsedContent);  // Gọi hàm callback xử lý message
        this.channel.ack(message);  // Gửi ACK báo đã xử lý xong
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new MessageBroker();
