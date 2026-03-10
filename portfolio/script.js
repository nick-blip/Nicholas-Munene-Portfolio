$(document).ready(function () {

    
    $(window).scroll(function () {
        if (this.scrollY > 20) {
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }

        if (this.scrollY > 500) {
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }

        // Trigger skill bar animation when skills section is in view
        animateSkillBars();

        // Trigger fade-in for sections
        revealOnScroll();
    });

  
    $('.scroll-up-btn').click(function () {
        $('html').animate({ scrollTop: 0 }, 600);
        $('html').css("scrollBehavior", "auto");
    });

  
    $('.navbar .menu li a').click(function () {
        $('html').css("scrollBehavior", "smooth");
        // Close mobile menu when a link is clicked
        $('.navbar .menu').removeClass("active");
        $('.menu-btn i').removeClass("active");
    });

 
    $('.menu-btn').click(function () {
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });


        strings: ["Web Developer", "Data Analyst", "IT Support Specialist", "AI Enthusiast", "Business Intelligence Analyst"],
        typeSpeed: 90,
        backSpeed: 55,
        backDelay: 1500,
        loop: true
    });

    var typed2 = new Typed(".typing-2", {
        strings: ["Web Developer", "Data Analyst", "IT Support Specialist", "AI Enthusiast", "Business Intelligence Analyst"],
        typeSpeed: 90,
        backSpeed: 55,
        backDelay: 1500,
        loop: true
    });

 
    $('.carousel').owlCarousel({
        margin: 20,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:    { items: 1, nav: false },
            600:  { items: 2, nav: false },
            1000: { items: 3, nav: false }
        }
    });

    
    var skillsAnimated = false;

    function animateSkillBars() {
        var skillsSection = $('.skills');
        if (skillsSection.length === 0) return;

        var sectionTop = skillsSection.offset().top;
        var windowBottom = $(window).scrollTop() + $(window).height();

        if (windowBottom > sectionTop + 100 && !skillsAnimated) {
            skillsAnimated = true;
            $('.skills .line').each(function () {
                var $line = $(this);
                // Read the target width from the CSS class via computed style
                var targetWidth = $line.css('--target-width') || getLineWidth($line);
                $line.css({ width: 0 }).animate({ width: targetWidth }, 1200);
            });
        }
    }

    // Map class names to widths (mirrors CSS)
    function getLineWidth($el) {
        if ($el.hasClass('html'))         return '90%';
        if ($el.hasClass('css'))          return '75%';
        if ($el.hasClass('js'))           return '80%';
        if ($el.hasClass('php'))          return '70%';
        if ($el.hasClass('mysql'))        return '75%';
        if ($el.hasClass('python'))       return '85%';
        if ($el.hasClass('r'))            return '70%';
        if ($el.hasClass('google-cloud')) return '65%';
        return '50%';
    }

    // Override CSS ::before widths so JS can animate them
    // We animate the line element itself instead of the pseudo-element
    $('.skills .line').each(function () {
        var $line = $(this);
        var targetWidth = getLineWidth($line);
        // Store target, start at 0
        $line.attr('data-width', targetWidth);
        $line.css('position', 'relative');

        // Create a real div inside instead of relying on ::before for animation
        $line.append('<span class="bar-fill"></span>');
        $line.find('.bar-fill').css({
            display: 'block',
            position: 'absolute',
            height: '100%',
            width: '0%',
            left: 0,
            top: 0,
            background: 'rgb(20, 40, 220)',
            borderRadius: '4px',
            transition: 'none'
        });
    });

    function animateSkillBarsV2() {
        var skillsSection = $('.skills');
        if (skillsSection.length === 0 || skillsAnimated) return;

        var sectionTop = skillsSection.offset().top;
        var windowBottom = $(window).scrollTop() + $(window).height();

        if (windowBottom > sectionTop + 80) {
            skillsAnimated = true;
            $('.skills .line').each(function (i) {
                var $line = $(this);
                var targetWidth = $line.attr('data-width');
                $line.find('.bar-fill').delay(i * 100).animate({ width: targetWidth }, {
                    duration: 1100,
                    easing: 'swing'
                });
            });
        }
    }

    $(window).scroll(animateSkillBarsV2);
    animateSkillBarsV2(); // run once on load in case already visible


    $('section').not('.home').css({
        opacity: 0,
        transform: 'translateY(40px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease'
    });

    function revealOnScroll() {
        $('section').not('.home').each(function () {
            var sectionTop = $(this).offset().top;
            var windowBottom = $(window).scrollTop() + $(window).height();
            if (windowBottom > sectionTop + 80) {
                $(this).css({ opacity: 1, transform: 'translateY(0)' });
            }
        });
    }

    revealOnScroll(); // run once on load


    $(window).scroll(function () {
        var scrollPos = $(window).scrollTop() + 80;
        $('.navbar .menu li a').each(function () {
            var target = $(this).attr('href');
            if (target && target.startsWith('#')) {
                var section = $(target);
                if (section.length) {
                    if (section.offset().top <= scrollPos &&
                        section.offset().top + section.outerHeight() > scrollPos) {
                        $('.navbar .menu li a').css({ color: '', fontWeight: '' });
                        $(this).css({ color: 'rgb(20, 147, 220)', fontWeight: '600' });
                    }
                }
            }
        });
    });

    $('.home').on('mousemove', function (e) {
        var offsetX = (e.clientX / $(window).width() - 0.5) * 18;
        var offsetY = (e.clientY / $(window).height() - 0.5) * 10;
        $(this).css('background-position',
            'calc(50% + ' + offsetX + 'px) calc(50% + ' + offsetY + 'px)');
    });

    $('.home').on('mouseleave', function () {
        $(this).css('background-position', 'center center');
    });


    $('.img-tag').each(function (i) {
        var delay = i * 0.8;
        $(this).css('animation-delay', delay + 's');
    });

    $('.services .card').on('mousemove', function (e) {
        var card   = $(this);
        var offset = card.offset();
        var cx     = e.pageX - offset.left - card.width() / 2;
        var cy     = e.pageY - offset.top  - card.height() / 2;
        var rotateX = (-cy / card.height() * 12).toFixed(2);
        var rotateY = ( cx / card.width()  * 12).toFixed(2);
        card.css('transform', 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.03)');
    }).on('mouseleave', function () {
        $(this).css('transform', 'perspective(600px) rotateX(0) rotateY(0) scale(1)');
        $(this).css('transition', 'transform 0.5s ease');
    });

   
    setTimeout(function () {
        $('.typed-cursor').css('color', 'rgb(20, 147, 220)');
    }, 300);

});
