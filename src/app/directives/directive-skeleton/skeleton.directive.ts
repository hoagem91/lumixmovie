import {Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef} from "@angular/core";
import {MovieCarouselComponent} from "../../components/movie-carousel/movie-carousel.component";
import {SkeletonLoaderComponent} from "../../shared/components/skeleton-loader/skeleton-loader.component";

function random(min:number,max:number):number{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
@Directive({selector:'[skeleton]'})
export class SkeletonDirective{
  @Input('skeleton') isLoading = false;
  @Input("skeletonRepeat") size = 1;
  @Input("skeletonWidth") width!:string;
  @Input("skeletonHeight") height!:string;
  @Input('skeletonClassName') className!:string;
  constructor(private tpl:TemplateRef<any>,private vcr:ViewContainerRef) {}
  ngOnChanges(changes:SimpleChanges){
    if(changes['isLoading']){
      this.vcr.clear();
      if(changes['isLoading'].currentValue){
        Array.from({length:this.size}).forEach(()=>{
          const ref = this.vcr.createComponent(SkeletonLoaderComponent);
          Object.assign(ref.instance,{
            width:this.width==='rand'?`${random(30,90)}%`:this.width,
            height:this.height,
            className:this.className,
          });
        });
      }else{
        this.vcr.createEmbeddedView(this.tpl)
      }
    }
  }
}
