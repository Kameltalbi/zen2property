import { HomeBento } from './HomeBento';
import { HomeCta } from './HomeCta';
import { HomeDocuments } from './HomeDocuments';
import { HomeHow } from './HomeHow';
import { HomeProduct } from './HomeProduct';
import { HomeTrust } from './HomeTrust';

export function LandingSections() {
  return (
    <div className="home-rest">
      <HomeProduct />
      <HomeBento />
      <HomeHow />
      <HomeDocuments />
      <HomeTrust />
      <HomeCta />
    </div>
  );
}
