import BlackFridayMailFooter from '../../components/blackFriday/BlackFridayMailFooter';
import BlackFridayTitle from '../../components/blackFriday/BlackFridayTitle';
import OfferFooter from '../../components/shared/OfferFooter';
import OfferHeader from '../../components/shared/OfferHeader';
import OfferLayout from '../../components/shared/OfferLayout';
import OfferLoader from '../../components/shared/OfferLoader';
import Deals from '../../components/shared/deal/Deals';
import hasOffer from '../../helpers/hasOffer';
import { OfferLayoutProps } from '../../interface';

const Layout = (props: OfferLayoutProps) => {
    return hasOffer(props) ? (
        <OfferLayout {...props}>
            <OfferHeader {...props}>
                <BlackFridayTitle />
            </OfferHeader>

            <Deals {...props} />

            <OfferFooter {...props}>
                <BlackFridayMailFooter {...props} />
            </OfferFooter>
        </OfferLayout>
    ) : (
        <OfferLoader />
    );
};

export default Layout;
