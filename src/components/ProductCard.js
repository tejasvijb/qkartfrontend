import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        alt={product.name}
        height="220"
        image={product.image}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography gutterBottom variant="h5" component="div">
          <b>${product.cost}</b>
        </Typography>
        <Rating name="read-only" value={product.rating} readOnly />
        <CardActions className="card-actions">
          <Button className="button" variant="contained" onClick={()=>handleAddToCart(product._id,1)}> <AddShoppingCartOutlined/> ADD TO CART</Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
