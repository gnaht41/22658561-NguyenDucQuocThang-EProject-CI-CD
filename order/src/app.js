const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setupOrderConsumer();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  async setupOrderConsumer() {
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const amqpServer = "amqp://rabbitmq:5672";
        const connection = await amqp.connect(amqpServer);
        console.log("Connected to RabbitMQ");
        // Tạo một channel để làm việc
        const channel = await connection.createChannel();
        // Đảm bảo queue 'orders' tồn tại
        await channel.assertQueue("orders");

        // Bắt đầu lắng nghe (consume) tin nhắn từ queue 'orders'
        channel.consume("orders", async (data) => {
          // Consume messages from the order queue on buy
          console.log("Consuming ORDER service");
          const { products, username, orderId } = JSON.parse(data.content);

          // Tạo một đối tượng Order mới từ Mongoose model
          const newOrder = new Order({
            products,
            user: username,
            totalPrice: products.reduce((acc, product) => acc + product.price, 0),
          });

          // Lưu đơn hàng mới vào MongoDB
          await newOrder.save();

          // Gửi tín hiệu ACK (Acknowledgement) về RabbitMQ báo đã xử lý xong tin nhắn
          channel.ack(data);
          console.log("Order saved to DB and ACK sent to ORDER queue");

          // Gửi tin nhắn chứa thông tin đơn hàng đã hoàn thành vào queue 'products'
          // Include orderId in the message
          // Để dịch vụ Product biết và cập nhật trạng thái
          const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
          channel.sendToQueue(
            "products",
            Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
          );
        });
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000); // add a delay to wait for RabbitMQ to start in docker-compose
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
