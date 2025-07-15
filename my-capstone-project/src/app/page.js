'use client';
import {
  AppBar, Toolbar, Typography, Box, Button, Container, Card, CardContent
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const bannerImages = ['/banner1.png', '/banner2.png', '/banner3.png'];

export default function HomePage() {
  return (
    <Box> 
      {/* Swiper Banner */}
      <Box sx={{ mt: 2 }}>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 3000 }}
          loop
          style={{ width: '60%', height: '20%' }}
        >
          {bannerImages.map((src, index) => (
            <SwiperSlide key={index}>
              <img
                src={src}
                alt={`banner ${index}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Cards: Notice, News, QnA */}
      <Container sx={{ mt: 5, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { title: 'Notice', content: 'New Materials Updated ' },
          { title: 'News', content: 'IELTS One Skill Retake' },
          { title: 'QnA', content: 'How to reach to my goal' },
        ].map(({ title, content }, index) => (
          <Card key={index} sx={{ width: 280 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{title}</Typography>
              <Typography variant="body2">{content}</Typography>
            </CardContent>
          </Card>
        ))}
      </Container>
    </Box>
  );
}
