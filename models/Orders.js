const mongoose = require('mongoose');
const {Schema}=mongoose;
const OrderSchema=new Schema({
    userName:{
        type:String,
        required:true,
        unique:true
    },
    order_data:{
        type:Array,
        required:true
    }
})

module.export=mongoose.model('Order',OrderSchema);