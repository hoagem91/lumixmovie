import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {CanDeactivate} from "@angular/router";

export interface CanComponentDeactivate {
  hasUnsavedChanges: () => boolean | Promise<boolean> | Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): boolean | Promise<boolean> | Observable<boolean> {
    return component.hasUnsavedChanges() ? confirm('Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?') : true;
  }
}
