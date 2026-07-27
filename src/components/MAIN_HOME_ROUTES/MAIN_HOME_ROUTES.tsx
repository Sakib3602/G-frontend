import Big from "../BasicComponents/Big/Big";
import CTABanner from "../BasicComponents/Ctbanner/CTABanner";
import FAQSection from "../BasicComponents/Faqsection/Faqsection";
import Hero from "../BasicComponents/Hero/Hero";
import Pillars from "../BasicComponents/Pillars/Pillars";
// import ServicesScroll from "../BasicComponents/ServicesScroll/ServicesScroll";cd ..



const MAIN_HOME_ROUTES = () => {
    return (
        <>
        <Hero></Hero>
        <Pillars></Pillars>
        <CTABanner></CTABanner>
        <Big></Big>
        <FAQSection></FAQSection>
        {/* <ServicesScroll></ServicesScroll> */}
        
        </>
    );
};

export default MAIN_HOME_ROUTES;