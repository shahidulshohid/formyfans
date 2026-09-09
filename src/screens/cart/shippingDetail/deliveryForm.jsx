import {
    Box,
    Typography,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const DELIVERY_FIELDS = [
    { id: "name", label: "Name", placeholder: "Enter Your Name" },
    { id: "phone", label: "Phone Number", placeholder: "Enter Your Number" },
    { id: "city", label: "City", placeholder: "Texas, Usa" },
    { id: "email", label: "Email Address", placeholder: "Enter Your Email" },
    { id: "state", label: "State", placeholder: "Texas, Usa" },
    { id: "zip", label: "Zip Code", placeholder: "123456" },
];

const DeliveryForm = ({
    shipping,
    onShippingChange,
    paymentMethod,
    onPaymentMethodChange,
    stripePaymentComplete = false,
}) => {
    const inputStyles = {
        bgcolor: "#5E1321",
        borderRadius: 10,
        "& .MuiInputBase-input": {
            color: "#FFFFFF",
            fontSize: 12,
            py: 1.5,
            px: 2,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
    };

    const renderField = (label, fieldKey, value, onChange, placeholder) => (
        <Box>
            <Typography fontSize={15} fontWeight={600} color="#5E1321" mb={0.5}>
                {label}
            </Typography>
            <TextField
                fullWidth
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(fieldKey, e.target.value)}
                sx={inputStyles}
            />
        </Box>
    );

    const handlePaymentChange = (e) => {
        const value = e.target.value;
        onPaymentMethodChange(value);
    };

    return (
        <Box>
            <Box
                sx={{
                    bgcolor: "white",
                    borderRadius: 3,
                    p: { xs: 2, md: 4 },
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    mb: 3,
                    maxWidth: "100%",
                }}
            >
                <Typography fontSize={18} fontWeight={600} color="#5E1321" mb={3}>
                    Delivery Information
                </Typography>

                <Grid container spacing={3}>
                    {DELIVERY_FIELDS.map((field) => (
                        <Grid key={field.id} item size={{ xs: 12, md: 6 }}>
                            {renderField(
                                field.label,
                                field.id,
                                shipping[field.id],
                                onShippingChange,
                                field.placeholder,
                            )}
                        </Grid>
                    ))}

                    <Grid item size={{ xs: 12, md: 12 }}>
                        {renderField(
                            "Delivery Address",
                            "address",
                            shipping.address,
                            onShippingChange,
                            "Enter your existing delivery address here",
                        )}
                    </Grid>
                </Grid>
            </Box>

            <Box
                sx={{
                    bgcolor: "white",
                    borderRadius: 3,
                    p: 2,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    mb: 3,
                    maxWidth: "100%",
                }}
            >
                <Typography fontSize={16} fontWeight={600} color="#5E1321" mb={2}>
                    Payment Method
                </Typography>

                <RadioGroup
                    value={paymentMethod}
                    onChange={handlePaymentChange}
                    sx={{ flexDirection: { xs: "column", sm: "row" } }}
                >
                    <FormControlLabel
                        value="online"
                        control={
                            <Radio
                                icon={
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            border: "2px solid #ccc",
                                        }}
                                    />
                                }
                                checkedIcon={<CheckCircleIcon sx={{ color: "#FF1572" }} />}
                            />
                        }
                        label={
                            <Typography fontSize={14} fontWeight={500} color="#333">
                                Online Payment
                                {stripePaymentComplete ? (
                                    <Box
                                        component="span"
                                        sx={{ color: "#0CA904", ml: 1, fontWeight: 600 }}
                                    >
                                        (Paid)
                                    </Box>
                                ) : null}
                            </Typography>
                        }
                    />
                    <FormControlLabel
                        value="cod"
                        control={
                            <Radio
                                icon={
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            border: "2px solid #ccc",
                                        }}
                                    />
                                }
                                checkedIcon={<CheckCircleIcon sx={{ color: "#FF1572" }} />}
                            />
                        }
                        label={
                            <Typography fontSize={14} fontWeight={500} color="#333">
                                Cash on delivery
                            </Typography>
                        }
                    />
                </RadioGroup>
            </Box>
        </Box>
    );
};

export default DeliveryForm;
