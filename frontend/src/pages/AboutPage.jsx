import React from 'react'
import { motion } from 'framer-motion'
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
} from '@mui/material'
import {
    HeartIcon,
    TruckIcon,
    ClockIcon,
    ShieldCheckIcon,
    UsersIcon,
    BuildingStorefrontIcon,
} from '@heroicons/react/24/outline'

const AboutPage = () => {
    const stats = [
        { label: 'Happy Customers', value: '50,000+', icon: <UsersIcon className="h-6 w-6" /> },
        { label: 'Partner Restaurants', value: '1,200+', icon: <BuildingStorefrontIcon className="h-6 w-6" /> },
        { label: 'Orders Delivered', value: '500,000+', icon: <TruckIcon className="h-6 w-6" /> },
        { label: 'Cities Served', value: '25+', icon: <HeartIcon className="h-6 w-6" /> },
    ]

    const values = [
        {
            title: 'Quality First',
            description: 'We partner only with restaurants that meet our high standards for food quality and hygiene.',
            icon: <ShieldCheckIcon className="h-8 w-8" />,
            color: 'primary.main'
        },
        {
            title: 'Fast Delivery',
            description: 'Our efficient delivery network ensures your food arrives fresh and on time, every time.',
            icon: <ClockIcon className="h-8 w-8" />,
            color: 'success.main'
        },
        {
            title: 'Customer Care',
            description: 'Your satisfaction is our priority. Our 24/7 support team is always here to help.',
            icon: <HeartIcon className="h-8 w-8" />,
            color: 'error.main'
        },
    ]

    const team = [
        {
            name: 'Vipul Singh',
            role: 'CEO & Founder',
            description: 'Passionate about connecting people with great food experiences.',
            avatar: 'VS'
        },
        {
            name: 'Jag',
            role: 'Head of Operations',
            description: 'Ensuring smooth operations and exceptional service delivery.',
            avatar: 'JA'
        },
        {
            name: 'Rama',
            role: 'Head of Technology',
            description: 'Building innovative solutions for seamless food ordering.',
            avatar: 'RM'
        },
    ]

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                mb: 3,
                                background: 'linear-gradient(45deg, #f97316, #ea580c)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            About Eatio
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: 'text.secondary',
                                mb: 4,
                                maxWidth: '800px',
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Connecting food lovers with their favorite restaurants through seamless technology and exceptional service.
                        </Typography>
                    </Box>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Grid container spacing={3} sx={{ mb: 8 }}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Card
                                    sx={{
                                        textAlign: 'center',
                                        p: 3,
                                        height: '100%',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 3,
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                                        {stat.icon}
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>

                {/* Our Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
                            Our Story
                        </Typography>
                        <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                                    Founded in 2020, Eatio began with a simple mission: to make delicious food accessible to everyone,
                                    anytime, anywhere. What started as a small team of food enthusiasts has grown into India's
                                    fastest-growing food delivery platform.
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                                    We believe that great food brings people together, and technology should make it easier,
                                    not harder, to enjoy those moments. That's why we've built a platform that prioritizes
                                    speed, quality, and customer satisfaction above all else.
                                </Typography>
                                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                                    Today, we're proud to serve millions of customers across India, partnering with thousands
                                    of restaurants to deliver not just food, but happiness to your doorstep.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        height: 400,
                                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                        borderRadius: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '4rem',
                                    }}
                                >
                                    🍽️
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </motion.div>

                {/* Our Values Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
                            Our Values
                        </Typography>
                        <Grid container spacing={4}>
                            {values.map((value, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Card
                                        sx={{
                                            p: 4,
                                            height: '100%',
                                            textAlign: 'center',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: 4,
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <Box sx={{ color: value.color, mb: 3 }}>
                                            {value.icon}
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                            {value.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {value.description}
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </motion.div>

                {/* Team Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
                            Meet Our Team
                        </Typography>
                        <Grid container spacing={4}>
                            {team.map((member, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Card
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            height: '100%',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 3,
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 3,
                                                bgcolor: 'primary.main',
                                                fontSize: '1.5rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {member.avatar}
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            {member.name}
                                        </Typography>
                                        <Chip
                                            label={member.role}
                                            color="primary"
                                            variant="outlined"
                                            sx={{ mb: 2 }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {member.description}
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </motion.div>

                {/* Contact CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                >
                    <Divider sx={{ my: 6 }} />
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                            Ready to Experience Eatio?
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                            Join millions of satisfied customers who trust Eatio for their food delivery needs.
                            Download our app or visit our website to start ordering today!
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Chip
                                label="📱 Available on iOS & Android"
                                color="primary"
                                variant="outlined"
                                sx={{ px: 2, py: 1, fontSize: '0.9rem' }}
                            />
                            <Chip
                                label="🌐 Order Online"
                                color="primary"
                                variant="outlined"
                                sx={{ px: 2, py: 1, fontSize: '0.9rem' }}
                            />
                            <Chip
                                label="📞 24/7 Support"
                                color="primary"
                                variant="outlined"
                                sx={{ px: 2, py: 1, fontSize: '0.9rem' }}
                            />
                        </Box>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    )
}

export default AboutPage