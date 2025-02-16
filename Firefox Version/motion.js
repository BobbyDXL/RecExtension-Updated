window.motion = {
    animate: (element, animation, options = {}) => {
        const { opacity, y, scale } = animation;
        const { duration = 0.3, delay = 0 } = options;
        
        element.style.transition = `all ${duration}s ease-in-out ${delay}s`;
        
        if (opacity) element.style.opacity = opacity[1];
        if (y) element.style.transform = `translateY(${y[1]}px)`;
        if (scale) element.style.transform = `scale(${scale[1]})`;
        
        return {
            finished: new Promise(resolve => {
                setTimeout(resolve, (duration + delay) * 1000);
            })
        };
    }
}; 