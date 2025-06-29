import nodemailer from 'nodemailer';

const sendOrderConfirmation = async (to, subject, orderId, products, totalAmount) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const productHtml = products.map(product => `
    <tr>
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>$${product.price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Order Confirmation</h2>
      <p>Dear ${to},</p>
      <p>Your order with ID <strong>${orderId}</strong> has been successfully placed.</p>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${productHtml}
        </tbody>
      </table>
      <p><strong>Total Amount:</strong> $${totalAmount}</p>
      <p>Thank you for shopping with us!</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    html
  });
};

export default sendOrderConfirmation;