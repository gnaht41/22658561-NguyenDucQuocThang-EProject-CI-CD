# EProject – Microservices (Auth, Product, Order, API Gateway) - Docker

##  Chạy Docker

![alt text](public/images/image-5.png)

## 1. Auth
- register
![alt text](public/images/image.png)

- login
![alt text](public/images/image-1.png)

=> Khi này sẽ tạo ra token, lấy token để sử dụng cho các dịch vụ khác

- dashboard
![alt text](public/images/image-2.png)

=> Cần sử dụng x-auth-token trong header để truy cập vào trang dashboard

- Dữ liệu
![alt text](public/images/image-4.png)

## 2. Product & Order
- Tạo sản phẩm api/products/
![alt text](public/images/image-6.png)

![alt text](public/images/image-7.png)

- Xem sản phẩm api/products/
![alt text](public/images/image-9.png)

- Mua sản phẩm gửi message sang queue orders để tạo đơn api/products/buy
![alt text](public/images/image-8.png)

![alt text](public/images/image-10.png)

## 3. Api - Gateway
- register
![alt text](public/images/image-19.png)

- login
![alt text](public/images/image-20.png)

- dashboard
![alt text](public/images/image-21.png)

- Dữ liệu
![alt text](public/images/image-22.png)

- Tạo sản phẩm api/products/
![alt text](public/images/image-23.png)

![alt text](public/images/image-24.png)

- Xem sản phẩm api/products/
![alt text](public/images/image-25.png)

- Mua sản phẩm gửi message sang queue orders để tạo đơn api/products/buy
![alt text](public/images/image-26.png)

![alt text](public/images/image-27.png)

## 4. RabbitMQ
![alt text](public/images/image-11.png)

![alt text](public/images/image-12.png)

![alt text](public/images/image-13.png)

![alt text](public/images/image-14.png)

![alt text](public/images/image-15.png)

![alt text](public/images/image-16.png)

![alt text](public/images/image-17.png)

![alt text](public/images/image-18.png)