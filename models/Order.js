const moongose = require("mongoose");
const OrderSchema = mongoose.Schema({
    order:{
        type: Array,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    client:{
        type: moongose.Schema.Types.ObjectId,
        required: true,
        ref:'Client'
    },
    seller:{
        type: moongose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    state:{
        type: String,
        default:"PENDING"
    },
    created:{
        type:Date,
        default:Date.now()
    }

});

module.exports = mongoose.model('Order',OrderSchema);